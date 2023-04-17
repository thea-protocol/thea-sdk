import * as utils from "../../../src/utils/utils";
import * as shared from "../../../src/modules/shared";
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { TheaERC20, IERC20Contract, ContractDetails, TheaError, consts, TheaNetwork } from "../../../src";
import { Wallet } from "@ethersproject/wallet";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../../mocks";
import { JsonRpcProvider, Network, Provider } from "@ethersproject/providers";

const vintageTokenContractAddress = consts[TheaNetwork.GANACHE].vintageTokenContract;

jest.mock("../../../src/modules/shared/execute", () => {
	return {
		execute: jest.fn().mockImplementation(() => {
			return {
				to: vintageTokenContractAddress,
				from: "0x123",
				contractAddress: vintageTokenContractAddress
			};
		})
	};
});

jest.mock("@ethersproject/providers", () => {
	return {
		JsonRpcProvider: jest.fn().mockImplementation((args) => {
			const value = {
				_isProvider: true,
				getNetwork: (): Promise<Network> => {
					return Promise.resolve({ chainId: args ?? 1337, name: "GANACHE" });
				}
			};
			return value as Provider;
		})
	};
});

describe("TheaERC20", () => {
	const signer = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	const theaERC20: TheaERC20 = new TheaERC20(signer, vintageTokenContractAddress);
	const owner = WALLET_ADDRESS;
	const spender = WALLET_ADDRESS;
	const mockContract: Partial<IERC20Contract> = {
		name: jest.fn().mockResolvedValue("Vintage Token"),
		allowance: jest.fn(),
		approve: jest.fn(),
		permit: jest.fn(),
		balanceOf: jest.fn(),
		provider: new JsonRpcProvider(),
		sigNonces: jest.fn().mockResolvedValue(0)
	};
	theaERC20.contract = mockContract as IERC20Contract;
	let validateAddressSpy: jest.SpyInstance;

	beforeEach(() => {
		validateAddressSpy = jest.spyOn(utils, "validateAddress");
	});

	afterEach(() => {
		validateAddressSpy.mockClear();
	});

	it("should return token allowance", async () => {
		const allowanceSpy = jest.spyOn(mockContract, "allowance").mockResolvedValueOnce(BigNumber.from(100));

		const result = await theaERC20.allowance(owner, spender);

		expect(allowanceSpy).toBeCalledWith(owner, spender);
		expect(result).toEqual(BigNumber.from(100));
		expect(validateAddressSpy).toHaveBeenCalledTimes(2);
	});

	it("should approve token", async () => {
		const details: ContractDetails & { contractFunction: string } = {
			contractFunction: "approve",
			address: vintageTokenContractAddress,
			name: "TheaERC20"
		};
		const txPromise = Promise.resolve({} as ContractTransaction);
		const executeSpy = jest.spyOn(shared, "execute");
		const approveSpy = jest.spyOn(mockContract, "approve").mockReturnValue(txPromise);

		await theaERC20.approve(spender, 100);

		expect(approveSpy).toBeCalledWith(spender, 100);
		expect(executeSpy).toHaveBeenCalledWith(txPromise, details);
		expect(validateAddressSpy).toHaveBeenCalledTimes(1);
	});

	it("should permit token", async () => {
		const nonceSpy = jest.spyOn(mockContract, "sigNonces");

		const signature = await theaERC20.permit(owner, spender, 100);

		expect(signature).toHaveProperty("v");
		expect(signature).toHaveProperty("r");
		expect(signature).toHaveProperty("s");
		expect(signature).toHaveProperty("deadline");

		expect(nonceSpy).toBeCalledWith(owner);
		expect(validateAddressSpy).toHaveBeenCalledTimes(2);
	});

	describe("approve ERC20 token", () => {
		it("should skip approval if already approved", async () => {
			const allowanceSpy = jest.spyOn(theaERC20, "allowance").mockResolvedValueOnce(BigNumber.from(100));
			const approveSpy = jest.spyOn(theaERC20, "approve").mockResolvedValueOnce({} as ContractReceipt);

			await theaERC20.approveERC20(owner, spender, 100);

			expect(allowanceSpy).toBeCalledWith(owner, spender);
			expect(approveSpy).not.toBeCalled();
		});

		it("should skip approval if already approved", async () => {
			const allowanceSpy = jest.spyOn(theaERC20, "allowance").mockResolvedValueOnce(BigNumber.from(99));
			const approveSpy = jest.spyOn(theaERC20, "approve").mockResolvedValueOnce({} as ContractReceipt);

			await theaERC20.approveERC20(owner, spender, 100);

			expect(allowanceSpy).toBeCalledWith(owner, spender);
			expect(approveSpy).toBeCalledWith(spender, 100);
		});
	});

	describe("check ERC20 balance", () => {
		it("should not throw error if balance is greater than amount", async () => {
			const balanceSpy = jest.spyOn(mockContract, "balanceOf").mockResolvedValueOnce(BigNumber.from(100));

			await theaERC20.checkERC20Balance(owner, BigNumber.from(100));

			expect(balanceSpy).toBeCalledWith(owner);
			expect(validateAddressSpy).toHaveBeenCalledTimes(1);
		});

		it("should throw error if balance is less than amount", async () => {
			jest.spyOn(mockContract, "balanceOf").mockResolvedValueOnce(BigNumber.from(99));

			await expect(theaERC20.checkERC20Balance(owner, BigNumber.from(100))).rejects.toThrow(
				new TheaError({ type: "INSUFFICIENT_FUNDS", message: "Insufficient Thea ERC20 funds" })
			);
		});
	});

	describe("get ERC20 balance", () => {
		it("should return balance", async () => {
			const balanceSpy = jest.spyOn(mockContract, "balanceOf").mockResolvedValueOnce(BigNumber.from(100));

			const result = await theaERC20.getBalance(owner);

			expect(balanceSpy).toBeCalledWith(owner);
			expect(result).toEqual(BigNumber.from(100));
			expect(validateAddressSpy).toHaveBeenCalledTimes(1);
		});
	});
});
