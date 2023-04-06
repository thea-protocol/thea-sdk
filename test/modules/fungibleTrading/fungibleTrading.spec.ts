import { swaps, CONTRACT_ADDRESS, PRIVATE_KEY, WALLET_ADDRESS, swapTransactions } from "./../../mocks";
import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	consts,
	FungibleTrading,
	POOL_FEE,
	QueryError,
	swapsQuery,
	SwapTransaction,
	TheaError,
	TheaNetwork,
	TheaSubgraphError
} from "../../../src";
import * as utils from "../../../src/utils/utils";

jest.mock("../../../src/modules/fungibleTrading/quoter", () => {
	return {
		Quoter: jest.fn().mockImplementation(() => {
			return {
				quoteBestPrice: jest.fn().mockResolvedValue(BigNumber.from(200))
			};
		})
	};
});

jest.mock("../../../src/modules/fungibleTrading/swapRouter", () => {
	return {
		SwapRouter: jest.fn().mockImplementation(() => {
			return {
				swap: jest.fn().mockResolvedValue({ to: "0x123", from: "0x123", contractAddress: "0x123" })
			};
		})
	};
});
describe("Fungible Trading", () => {
	let fungibleTrading: FungibleTrading;
	const wallet = new Wallet(PRIVATE_KEY);
	const amount = BigNumber.from(100);
	const network = TheaNetwork.GANACHE;
	const amountOut = BigNumber.from(200);
	beforeEach(() => {
		fungibleTrading = new FungibleTrading(wallet, network);
	});

	describe("queryTokenPrice", () => {
		it("should return token price from stable coin to token", async () => {
			const queryTokenPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const result = await fungibleTrading.queryTokenPrice({
				tokenIn: "Stable",
				tokenOut: "SDG"
			});

			expect(queryTokenPriceSpy).toBeCalledWith(
				consts[`${network}`].stableTokenContract,
				consts[`${network}`].sdgTokenContract,
				1e6
			);
			expect(result).toEqual(amountOut.toString());
		});

		it("should return token price from token to stable coin ", async () => {
			const queryTokenPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const result = await fungibleTrading.queryTokenPrice({
				tokenIn: "SDG"
			});

			expect(queryTokenPriceSpy).toBeCalledWith(
				consts[`${network}`].sdgTokenContract,
				consts[`${network}`].stableTokenContract,
				1e4
			);
			expect(result).toEqual(amountOut.toString());
		});
	});

	describe("swapTokens", () => {
		beforeAll(() => {
			jest.useFakeTimers();
			jest.setSystemTime(new Date(2022, 0, 1));
		});

		afterAll(() => {
			jest.useRealTimers();
		});

		const tokenInAddr = consts[`${network}`].sdgTokenContract;
		const stableTokenAddr = consts[`${network}`].stableTokenContract;
		it("should swap tokens", async () => {
			const quoteBestPriceSpy = jest.spyOn(fungibleTrading.quoter, "quoteBestPrice");
			const swapSpy = jest.spyOn(fungibleTrading.swapRouter, "swap");

			const result = await fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" });

			expect(quoteBestPriceSpy).toHaveBeenCalledWith(tokenInAddr, stableTokenAddr, amount);

			expect(swapSpy).toHaveBeenCalledWith(
				{
					tokenIn: tokenInAddr,
					tokenOut: stableTokenAddr,
					fee: POOL_FEE,
					recipient: WALLET_ADDRESS,
					deadline: expect.any(Number),
					amountIn: amount,
					amountOutMinimum: BigNumber.from(199),
					sqrtPriceLimitX96: 0
				},
				"SDG"
			);

			expect(result).toMatchObject({ to: "0x123", from: "0x123", contractAddress: "0x123" });
		});

		it("should throw error if providerOrSigner is not a signer", async () => {
			const fungibleTrading = new FungibleTrading(new JsonRpcProvider(), network);
			await expect(fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" })).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should fail if quoter returns 0 amountOut", async () => {
			jest.spyOn(fungibleTrading.quoter, "quoteBestPrice").mockResolvedValue(BigNumber.from(0));
			await expect(fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" })).rejects.toThrow(
				new TheaError({ type: "INVALID_TOKEN_PRICE", message: "Coudn't fetch best token price from pair pools" })
			);
		});

		it("should fail if invalid slippage tollerance value was passed", async () => {
			await expect(
				fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" }, { slippageTolerance: 1.1 })
			).rejects.toThrow(
				new TheaError({
					type: "INVALID_SLIPPAGE_TOLERANCE_VALUE",
					message: "Slippage tolerance can't be greater than 1 or less then 0"
				})
			);
		});

		it("should extract swap options", async () => {
			const swapOptions = { slippageTolerance: 1, deadline: Date.now() + 100000, recipient: "0x123" };
			const swapSpy = jest.spyOn(fungibleTrading.swapRouter, "swap");
			await fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" }, swapOptions);

			expect(swapSpy).toHaveBeenCalledWith(
				{
					tokenIn: tokenInAddr,
					tokenOut: stableTokenAddr,
					fee: POOL_FEE,
					recipient: swapOptions.recipient,
					deadline: swapOptions.deadline,
					amountIn: amount,
					amountOutMinimum: BigNumber.from(198),
					sqrtPriceLimitX96: 0
				},
				"SDG"
			);
		});

		it("should throw error if deadline is in past", async () => {
			const swapOptions = { slippageTolerance: 1, deadline: 1000, recipient: "0x123" };
			await expect(fungibleTrading.swapTokens({ amountIn: amount, tokenIn: "SDG" }, swapOptions)).rejects.toThrow(
				new TheaError({ type: "INVALID_DEADLINE", message: "Deadline can't be in past" })
			);
		});
	});

	describe("transactionHistory", () => {
		it("should return transaction history for a given wallet address", async () => {
			consts[`${TheaNetwork.GANACHE}`].currentNbtTokenContract = CONTRACT_ADDRESS;
			const httpClient = jest.spyOn(fungibleTrading.httpClient, "post").mockResolvedValueOnce({ data: { swaps } });
			const getERC20ContractAddressSpy = jest
				.spyOn(utils, "getERC20ContractAddress")
				.mockReturnValueOnce("0x1D6DBfb520ee332bc14e800A832389F731820787")
				.mockReturnValueOnce("0x5B518de3F2743A33f79f7a312e10Eeac6f778A6c");

			const result: SwapTransaction[] = (await fungibleTrading.transactionHistory(WALLET_ADDRESS)) as SwapTransaction[];

			expect(httpClient).toBeCalledWith(
				"",
				swapsQuery(
					WALLET_ADDRESS,
					"0x5B518de3F2743A33f79f7a312e10Eeac6f778A6c".toLowerCase(),
					"0x1D6DBfb520ee332bc14e800A832389F731820787".toLowerCase()
				)
			);
			expect(getERC20ContractAddressSpy).toBeCalledTimes(2);
			expect(result).toEqual(swapTransactions);
		});

		it("should throw error with list of query errors", async () => {
			const expectedResult = { errors: [{ error: "indexing_error" }] };
			jest.spyOn(fungibleTrading.httpClient, "post").mockResolvedValueOnce(expectedResult);
			await expect(fungibleTrading.transactionHistory(WALLET_ADDRESS)).rejects.toThrow(
				new TheaSubgraphError("Subgraph call error when trying to query swaps", [
					{ error: "indexing_error" }
				] as QueryError[])
			);
		});
	});
});
