import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider, Log } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Events, TheaError, Convert, IBaseTokenManagerContract, TheaNetwork, consts } from "../../src";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";
import * as shared from "../../src/modules/shared";
import BaseTokenManager_ABI from "../../src/abi/BaseTokenManager_ABI.json";
import { Interface } from "@ethersproject/abi";

const baseTokenManagerContractAddress = consts[TheaNetwork.GANACHE].baseTokenManagerContract;
consts[TheaNetwork.GANACHE].relayerUrl = "https://api.defender.openzeppelin.com/";
jest.mock("../../src/modules/shared", () => {
	return {
		...jest.requireActual("../../src/modules/shared"),
		checkBalance: jest.fn(),
		approve: jest.fn(),
		permit: jest.fn(),
		executeWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress,
				id: "1",
				amount: "1000"
			};
		}),
		relayWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress,
				id: "1",
				amount: "1000"
			};
		})
	};
});

jest.mock("../../src/utils", () => {
	return {
		...jest.requireActual("../../src/utils"),
		getBalance: jest
			.fn()
			.mockResolvedValueOnce(BigNumber.from("10000000000000000"))
			.mockResolvedValueOnce(BigNumber.from(0)),
		getAddress: jest.fn().mockImplementation(() => WALLET_ADDRESS)
	};
});

describe("Convert", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	let convert: Convert;
	const tokenId = "1";
	const amount = BigNumber.from(1000);
	const network = TheaNetwork.GANACHE;
	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: baseTokenManagerContractAddress,
			from: "0x123",
			contractAddress: baseTokenManagerContractAddress
		})
	};

	const iface = new Interface(BaseTokenManager_ABI.abi);
	iface.encodeFunctionData = jest.fn();

	const mockContract: Partial<IBaseTokenManagerContract> = {
		convert: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction),
		sigNonces: jest.fn().mockResolvedValue(0),
		interface: iface
	};

	beforeEach(() => {
		convert = new Convert(providerOrSigner, network);
		convert.contract = mockContract as IBaseTokenManagerContract;
	});

	describe("convertNFT", () => {
		it("should throw error that signer is required", async () => {
			convert = new Convert(new JsonRpcProvider(), network);
			await expect(convert.convertNFT(tokenId, amount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(convert.convertNFT(tokenId, BigNumber.from(-1))).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be greater than 0"
				})
			);
		});

		it("should call convert method from contract", async () => {
			const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const convertSpy = jest.spyOn(convert.contract, "convert").mockReturnValue(txPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");

			const result = await convert.convertNFT(tokenId, amount);
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				tokenId,
				amount
			});
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: baseTokenManagerContractAddress
			});
			expect(executeSpy).toHaveBeenCalledWith(
				txPromise,
				{
					name: BaseTokenManager_ABI.contractName,
					address: baseTokenManagerContractAddress,
					contractFunction: "convert"
				},
				convert.extractIdAndAmountFromEvent
			);
			expect(convertSpy).toHaveBeenCalledWith(tokenId, amount);
			expect(result).toMatchObject({
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress
			});
		});

		it("should relay transaction on insufficient gas", async () => {
			const relaySpy = jest.spyOn(shared, "relayWithResponse");
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance").mockReturnThis();
			const permitSpy = jest.spyOn(shared, "permit");

			const result = await convert.convertNFT(tokenId, amount);

			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				tokenId,
				amount
			});
			expect(permitSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: baseTokenManagerContractAddress
			});
			expect(relaySpy).toHaveBeenCalled();
			expect(result).toMatchObject({
				to: baseTokenManagerContractAddress,
				from: "0x123",
				contractAddress: baseTokenManagerContractAddress
			});
		});
	});

	describe("extractIdAndAmountFromEvent", () => {
		it("should return undefined id and amount if no events passed", () => {
			const result = convert.extractIdAndAmountFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined id and amount if no Convert event passed", () => {
			const result = convert.extractIdAndAmountFromEvent();
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		it("should return undefined id and amount if no args in event", () => {
			const event: Partial<Event> = {
				event: Events.convert
			};
			const result = convert.extractIdAndAmountFromEvent([event as Event]);
			expect(result.id).toBeUndefined();
			expect(result.amount).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract id and amount from event", () => {
			const tokenId = "1";
			const amount = "1000";
			const event: Partial<Event> = {
				event: Events.convert,
				args: { tokenId, amount } as any
			};
			const result = convert.extractIdAndAmountFromEvent([event as Event]);
			expect(result.id).toBe("1");
			expect(result.amount).toBe("1000");
		});

		describe("extractIdAndAmountFromLog", () => {
			it("should return undefined id and amount if no logs passed", () => {
				const result = convert.extractIdAndAmountFromLog();
				expect(result.id).toBeUndefined();
				expect(result.amount).toBeUndefined();
			});

			it("should return undefined id and amount if no Convert logs passed", () => {
				const result = convert.extractIdAndAmountFromLog();
				expect(result.id).toBeUndefined();
				expect(result.amount).toBeUndefined();
			});

			it("should extract id and amount from logs", () => {
				const log: Log = {
					transactionIndex: 10,
					blockNumber: 33625905,
					transactionHash: "0x72bf880761f9f2c2e91aaa13f61424d56635723e2bf9e29a1356b804c9959207",
					address: baseTokenManagerContractAddress,
					topics: [
						"0xd25ed857c9bba3b62ea894bc5be45b59c376bae644b4ee89bd6e35d566d1bb37",
						"0x0000000000000000000000000000000000000000000000000000000000000002"
					],
					data: "0x00000000000000000000000000000000000000000000000000000000000003e8",
					logIndex: 49,
					blockHash: "0xa0880a2e8e336d185896f00736298f719afb85ca628920555c8240c332824150",
					removed: false
				};
				const result = convert.extractIdAndAmountFromLog([log as Log]);
				expect(result.id).toBe("2");
				expect(result.amount).toBe("1000");
			});
		});
	});
});
