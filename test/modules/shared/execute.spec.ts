import { ContractReceipt, ContractTransaction, Event } from "@ethersproject/contracts";
import {
	consts,
	ContractDetails,
	Events,
	execute,
	executeWithResponse,
	HttpClient,
	RecoverEvent,
	relay,
	relayWithResponse,
	TheaContractCallError,
	TheaNetwork
} from "../../../src";
import { InfuraProvider, Log, Provider, TransactionReceipt } from "@ethersproject/providers";
import { Interface } from "@ethersproject/abi";
import BaseTokenManager_ABI from "../../../src/abi/BaseTokenManager_ABI.json";

jest.mock("@ethersproject/providers", () => {
	return {
		InfuraProvider: jest.fn().mockImplementation(() => {
			const value = {
				_isProvider: true,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
				getTransactionReceipt: (transactionHash: string): Promise<TransactionReceipt> => {
					const log: Partial<Log> = {
						topics: [
							"0x9692b528745f48333680160d05b753540b75f3b0f14f03c570701d4777e22fa8",
							"0x0000000000000000000000000000000000000000000000000000000000000001"
						],
						data: "0x00000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000bd44572e53343a0f003b719cf438c6338bd29d9c"
					};
					return Promise.resolve({ to: "0x123", logs: [log] } as TransactionReceipt);
				}
			};
			return value as Provider;
		})
	};
});

describe("Execute", () => {
	const details: ContractDetails & { contractFunction: string } = {
		contractFunction: "test",
		address: "0x123",
		name: "test"
	};
	const contractReceipt: Partial<ContractReceipt> = {
		to: "0x123"
	};

	const tx: Partial<ContractTransaction> = {
		hash: "0x123",
		from: "0x123",
		wait: () => Promise.resolve(contractReceipt as ContractReceipt)
	};

	it("should throw error if transaction fails", async () => {
		const txPromise = Promise.reject(new Error("Transaction failed"));

		await expect(execute(txPromise, details)).rejects.toThrow(
			new TheaContractCallError(
				{
					type: "TRANSACTION_FAILED",
					message: "Transaction failed"
				},
				details
			)
		);
	});

	it("should return contract receipt", async () => {
		const txPromise = Promise.resolve(tx as ContractTransaction);
		const waitSpy = jest.spyOn(tx, "wait");

		const result = await execute(txPromise, details);

		expect(result).toMatchObject(contractReceipt);
		expect(waitSpy).toHaveBeenCalled();
	});

	it("should return contract receipt with response", async () => {
		const event: Partial<Event> = {
			event: "Test",
			args: [1]
		};
		contractReceipt.events = [event as Event];

		const txPromise = Promise.resolve(tx as ContractTransaction);
		const responseCallback = (events?: Event[]): { value?: string } => {
			const response: { value?: string } = {};
			if (events) {
				const event = events.find((e) => e.event === "Test");
				if (event) {
					response.value = event.args?.[0].toString();
				}
			}
			return response;
		};
		const result = await executeWithResponse<{ value?: string }>(txPromise, details, responseCallback);
		expect(result).toMatchObject({ ...contractReceipt, value: "1" });
	});
});

describe("Relay", () => {
	const httpClient = new HttpClient(consts[TheaNetwork.GANACHE].relayerUrl);
	const provider = new InfuraProvider();

	const details: ContractDetails & { contractFunction: string } = {
		contractFunction: "test",
		address: "0x123",
		name: "test"
	};
	const contractReceipt: Partial<ContractReceipt> = {
		to: "0x123"
	};

	it("should throw error if transaction fails", async () => {
		const txRequest = {
			to: "0xabc",
			data: "0x789xyz"
		};

		jest.spyOn(httpClient, "post").mockResolvedValue({ status: "error" });

		await expect(relay(httpClient, provider, txRequest, details)).rejects.toThrow(
			new TheaContractCallError(
				{
					type: "TRANSACTION_FAILED",
					message: "Transaction failed"
				},
				details
			)
		);
	});

	it("should return contract receipt", async () => {
		const txRequest = {
			to: "0xabc",
			data: "0x789xyz"
		};

		jest.spyOn(httpClient, "post").mockResolvedValue({
			result: JSON.stringify("0xabb")
		});
		const receiptSpy = jest.spyOn(provider, "getTransactionReceipt");

		const result = await relay(httpClient, provider, txRequest, details);

		expect(result).toMatchObject(contractReceipt);
		expect(receiptSpy).toHaveBeenCalled();
	});

	it("should return contract receipt with response", async () => {
		const txRequest = {
			to: "0xabc",
			data: "0x789xyz"
		};

		const iface = new Interface(BaseTokenManager_ABI.abi);
		const responseCallback = (logs?: Log[]): RecoverEvent => {
			const logDesc = logs?.map((log) => iface.parseLog(log));
			const response: RecoverEvent = { id: undefined, amount: undefined };
			if (logDesc) {
				const log = logDesc.find((log) => log.name === Events.recover);
				if (log) {
					response.id = log.args?.tokenId.toString();
					response.amount = log.args?.amount.toString();
				}
			}

			return response;
		};
		const result = await relayWithResponse<RecoverEvent>(httpClient, provider, txRequest, details, responseCallback);
		expect(result).toMatchObject({ ...contractReceipt, id: "1", amount: "1000" });
	});
});
