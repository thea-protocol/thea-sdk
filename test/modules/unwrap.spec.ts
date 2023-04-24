import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Event } from "@ethersproject/contracts";
import { JsonRpcProvider, Log } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { consts, Events, IRegistryContract, TheaError, TheaNetwork, Unwrap } from "../../src";
import { PRIVATE_KEY, WALLET_ADDRESS } from "../mocks";
import * as shared from "../../src/modules/shared";
import * as utils from "../../src/utils/utils";
import Registry_ABI from "../../src/abi/Registry_ABI.json";
import { Interface } from "@ethersproject/abi";

consts[TheaNetwork.GANACHE].relayerUrl = "https://api.defender.openzeppelin.com/";

const registryContractAddress = consts[TheaNetwork.GANACHE].registryContract;
jest.mock("../../src/modules/shared", () => {
	return {
		...jest.requireActual("../../src/modules/shared"),
		checkBalance: jest.fn(),
		approve: jest.fn(),
		permit: jest.fn(),
		executeWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: registryContractAddress,
				from: "0x123",
				contractAddress: registryContractAddress,
				requestId: "1"
			};
		}),
		relayWithResponse: jest.fn().mockImplementation(() => {
			return {
				to: registryContractAddress,
				from: "0x123",
				contractAddress: registryContractAddress,
				id: "1",
				amount: "1000"
			};
		})
	};
});

jest.mock("../../src/utils/utils", () => {
	return {
		__esModule: true,
		...jest.requireActual("../../src/utils/utils"),
		getBalance: jest
			.fn()
			.mockImplementationOnce(() => BigNumber.from("10000000000000000"))
			.mockImplementationOnce(() => BigNumber.from(0)),
		getAddress: jest.fn().mockImplementation(() => WALLET_ADDRESS)
	};
});

describe("Unwrap", () => {
	const providerOrSigner = new Wallet(PRIVATE_KEY);
	let unwrap: Unwrap;
	const tokenId = "1";
	const amount = BigNumber.from(1000);
	const offchainAccount = "0x1234567890";

	const contractTransaction: Partial<ContractTransaction> = {
		wait: jest.fn().mockResolvedValue({
			to: registryContractAddress,
			from: "0x123",
			contractAddress: registryContractAddress
		})
	};

	const iface = new Interface(Registry_ABI.abi);
	iface.encodeFunctionData = jest.fn();

	const mockContract: Partial<IRegistryContract> = {
		unwrap: jest.fn().mockResolvedValue(contractTransaction as ContractTransaction),
		requests: jest.fn().mockResolvedValue({ status: 0, maker: "0x123", tokenId, amount }),
		sigNonces: jest.fn().mockResolvedValue(0),
		interface: iface
	};
	const network = TheaNetwork.GANACHE;
	beforeEach(() => {
		unwrap = new Unwrap(providerOrSigner, network);
		unwrap.contract = mockContract as IRegistryContract;
	});

	describe("unwrapToken", () => {
		it("should throw error that signer is required", async () => {
			unwrap = new Unwrap(new JsonRpcProvider(), network);
			await expect(unwrap.unwrapToken(tokenId, amount, offchainAccount)).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(unwrap.unwrapToken(tokenId, BigNumber.from(1001), offchainAccount)).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be a ton. Value must be greater than 0 and divisible by 1000"
				})
			);
		});

		it("should call unwrap method from contract", async () => {
			const txPromise = Promise.resolve(contractTransaction as ContractTransaction);
			const unwrapSpy = jest.spyOn(unwrap.contract, "unwrap").mockReturnValue(txPromise);
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance");
			const approveSpy = jest.spyOn(shared, "approve");
			const executeSpy = jest.spyOn(shared, "executeWithResponse");
			const tokenAmountShouldBeTonSpy = jest.spyOn(utils, "tokenAmountShouldBeTon");
			const result = await unwrap.unwrapToken(tokenId, amount, offchainAccount);

			expect(result.requestId).toBe("1");
			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, { token: "ERC1155", tokenId, amount });
			expect(approveSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: registryContractAddress
			});
			expect(executeSpy).toHaveBeenCalledWith(
				txPromise,
				{
					name: Registry_ABI.contractName,
					address: registryContractAddress,
					contractFunction: "unwrap"
				},
				unwrap.extractRequestIdFromEvent
			);
			expect(unwrapSpy).toHaveBeenCalledWith(tokenId, amount, offchainAccount);
			expect(result).toMatchObject({
				to: registryContractAddress,
				from: "0x123",
				contractAddress: registryContractAddress
			});
			expect(tokenAmountShouldBeTonSpy).toHaveBeenCalledWith(amount);
		});

		it("should relay transaction on insufficient gas", async () => {
			const relaySpy = jest.spyOn(shared, "relayWithResponse");
			const checkBalanceSpy = jest.spyOn(shared, "checkBalance").mockReturnThis();
			const permitSpy = jest.spyOn(shared, "permit");

			const result = await unwrap.unwrapToken(tokenId, amount, offchainAccount);

			expect(checkBalanceSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				tokenId,
				amount
			});
			expect(permitSpy).toHaveBeenCalledWith(providerOrSigner, network, {
				token: "ERC1155",
				spender: registryContractAddress
			});
			expect(relaySpy).toHaveBeenCalled();
			expect(result).toMatchObject({
				to: registryContractAddress,
				from: "0x123",
				contractAddress: registryContractAddress
			});
		});
	});

	describe("extractRequestIdFromEvent", () => {
		it("should return undefined request id if no events passed", () => {
			const result = unwrap.extractRequestIdFromEvent();
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if no Unwrap event passed", () => {
			const result = unwrap.extractRequestIdFromEvent([]);
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if args in event", () => {
			const event: Partial<Event> = {
				event: Events.unwrap
			};
			const result = unwrap.extractRequestIdFromEvent([event as Event]);
			expect(result.requestId).toBeUndefined();
		});

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		it("should extract request id from event", () => {
			const requestId = "1";
			const event: Partial<Event> = {
				event: Events.unwrap,
				args: { requestId } as any
			};
			const result = unwrap.extractRequestIdFromEvent([event as Event]);
			expect(result.requestId).toBe("1");
		});
	});

	describe("extractRequestIdFromLog", () => {
		it("should return undefined request id if no logs passed", () => {
			const result = unwrap.extractRequestIdFromLog();
			expect(result.requestId).toBeUndefined();
		});

		it("should return undefined request id if no Unwrap logs passed", () => {
			const result = unwrap.extractRequestIdFromLog();
			expect(result.requestId).toBeUndefined();
		});

		it("should extract request id from logs", () => {
			const log: Log = {
				transactionIndex: 4,
				blockNumber: 33708557,
				transactionHash: "0x7637da26f233b53ea1dda7e66e5c7677f486f9ae6c7a134facda2eda80afe26d",
				address: registryContractAddress,
				topics: [
					"0x123058a603e310439e60c4a3b16905105a0605670c0cb813b579f7a316301955",
					"0x0000000000000000000000000000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000000000000000000000000000001"
				],
				data: "0x00000000000000000000000000000000000000000000000000000000000003e80000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002a30786264343435373265353333343361306630303362373139636634333863363333386264323964396300000000000000000000000000000000000000000000",
				logIndex: 15,
				blockHash: "0x8de2f3de37202499e038fd868118abbe921a840a7ee3a9f3701e0bdfdbd5dee1",
				removed: false
			};
			const result = unwrap.extractRequestIdFromLog([log as Log]);
			expect(result.requestId).toBe("1");
		});
	});

	describe("getUnwrapTokenState", () => {
		it("should call requests mapping from contract", async () => {
			const requestsSpy = jest.spyOn(unwrap.contract, "requests");

			const result = await unwrap.getUnwrapTokenState(1);

			expect(result).toEqual({ status: 0, maker: "0x123", tokenId: tokenId.toString(), amount: amount.toString() });
			expect(requestsSpy).toHaveBeenCalledWith(1);
		});

		it("should throw error if tokenId is not valid", async () => {
			await expect(unwrap.getUnwrapTokenState(0)).rejects.toThrow(
				new TheaError({
					type: "INVALID_REQUEST_ID_VALUE",
					message: "Request id should be greater than 0"
				})
			);
		});
	});
});
