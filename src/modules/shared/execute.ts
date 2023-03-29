import { ContractReceipt, ContractTransaction, Event } from "@ethersproject/contracts";
import { Log, Provider } from "@ethersproject/providers";
import { ContractDetails, RelayerRequest, RelayerResponse } from "../../types";
import { TheaContractCallError } from "../../utils";
import { HttpClient } from "./httpClient";

export const execute = async (
	txPromise: Promise<ContractTransaction>,
	details: ContractDetails & { contractFunction: string; contractArgs?: string[] }
): Promise<ContractReceipt> => {
	try {
		const tx = await txPromise;
		return tx.wait();
	} catch (error) {
		throw new TheaContractCallError(
			{
				type: "TRANSACTION_FAILED",
				message: error.message
			},
			details
		);
	}
};

export const executeWithResponse = async <T>(
	txPromise: Promise<ContractTransaction>,
	details: ContractDetails & { contractFunction: string },
	responseExtractCb: (events?: Event[]) => T
): Promise<T & ContractReceipt> => {
	const reciept = await execute(txPromise, details);
	return { ...responseExtractCb(reciept.events), ...reciept };
};

export const relay = async (
	httpClient: HttpClient,
	provider: Provider,
	request: RelayerRequest,
	details: ContractDetails & { contractFunction: string; contractArgs?: string[] }
): Promise<ContractReceipt> => {
	try {
		return httpClient.post<RelayerRequest, RelayerResponse>("/", request).then(async (response) => {
			const txHash = JSON.parse(response.result);
			return provider.getTransactionReceipt(txHash);
		});
	} catch (error) {
		throw new TheaContractCallError(
			{
				type: "TRANSACTION_FAILED",
				message: error.message
			},
			details
		);
	}
};

export const relayWithResponse = async <T>(
	httpClient: HttpClient,
	provider: Provider,
	request: RelayerRequest,
	details: ContractDetails & { contractFunction: string; contractArgs?: string[] },
	responseExtractCb: (logs?: Log[]) => T
): Promise<T & ContractReceipt> => {
	const reciept = await relay(httpClient, provider, request, details);
	return { ...responseExtractCb(reciept.logs), ...reciept };
};
