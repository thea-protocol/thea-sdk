import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { Contract, ContractReceipt } from "@ethersproject/contracts";
import {
	OrderRecord,
	OrderCreateRequest,
	TheaNetwork,
	OrderRequest,
	OptionsOrderStruct,
	ProviderOrSigner,
	OptionsContractRecord,
	OptionsProduct,
	DeploymentStatus,
	HttpResponseIn
} from "../types";
import { amountShouldBeGTZero, consts, signerRequired, TheaError, typedDataSignerRequired } from "../utils";
import { execute, HttpClient } from "./shared";
import TheaOptions_ABI from "../abi/TheaOptions_ABI.json";

export class Options {
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;
	readonly signer: ProviderOrSigner;

	constructor(signer: ProviderOrSigner, network: TheaNetwork) {
		this.httpClient = new HttpClient(consts[`${network}`].theaApiBaseUrl);
		this.network = network;
		this.signer = signer;
	}

	/**
	 * Requests tokenization
	 * @param btOptionId - option product ID
	 * @param quantity - order quantity
	 * @returns OrderRecord @see OrderRecord
	 */
	async createOrder(btOptionId: string, quantity: number): Promise<HttpResponseIn<OrderRecord>> {
		amountShouldBeGTZero(quantity);
		typedDataSignerRequired(this.signer);
		const response = await this.httpClient.post<{ btOptionId: string; quantity: number }, HttpResponseIn<OrderRequest>>(
			`/bt_options_orders/prepare`,
			{
				btOptionId,
				quantity
			}
		);
		const signedOrder = await this.signOrder({ orderId: response.result.orderId, btOptionId, quantity });
		return this.httpClient.post<OrderCreateRequest, HttpResponseIn<OrderRecord>>(`/bt_options_orders/create`, {
			orderId: response.result.orderId,
			btOptionId,
			quantity,
			signature: signedOrder
		});
	}

	/**
	 * Query all option orders
	 * @returns OrderRecords @see OrderRecords
	 */
	getOrders(): Promise<HttpResponseIn<OrderRecord[]>> {
		return this.httpClient.post<Record<string, never>, HttpResponseIn<OrderRecord[]>>("/bt_options_orders/list", {});
	}

	/**
	 * Returns current options strike and premium
	 * @returns OptionsProduct @see OptionsProduct
	 */
	async getCurrentStrikeAndPremium(): Promise<OptionsProduct[]> {
		const optionsContracts = await this.httpClient
			.post<Record<string, never>, HttpResponseIn<OptionsContractRecord[]>>("/bt_options_contracts/list", {})
			.then((response) =>
				response.result
					.filter(({ deploymentStatus }) => deploymentStatus === DeploymentStatus.DEPLOYED)
					.sort((a, b) => Date.parse(b.expiry) - Date.parse(a.expiry))
			);
		return this.httpClient
			.post<Record<string, never>, HttpResponseIn<OptionsProduct[]>>("/bt_options/list", {})
			.then((response) =>
				response.result.filter(
					({ contractId, contractAddr }) =>
						contractId === optionsContracts[0].uuid && contractAddr === optionsContracts[0].contractAddress
				)
			);
	}

	/**
	 * Returns current options strike and premium
	 * @param orderId - option ID
	 * @param btOptionId - option product ID
	 * @returns OptionsProduct @see OptionsProduct
	 */
	async exercise(orderId: string, btOptionId: string): Promise<ContractReceipt> {
		signerRequired(this.signer);
		const optionsProduct = await this.httpClient
			.post<Record<string, never>, HttpResponseIn<OptionsProduct[]>>("/bt_options/list", {})
			.then((response) => response.result.find(({ uuid }) => uuid === btOptionId));

		if (!optionsProduct)
			throw new TheaError({ type: "INVALID_OPTION_PRODUCT_ID", message: "Options product id is invalid" });

		const optionsContract = new Contract(optionsProduct.contractAddr, TheaOptions_ABI.abi, this.signer);
		return execute(optionsContract.exercise(orderId), {
			name: TheaOptions_ABI.contractName,
			address: optionsProduct.contractAddr,
			contractFunction: "exercise"
		});
	}

	private async signOrder(order: OptionsOrderStruct): Promise<string> {
		const rawSignature = await this.signOrderWithEoaWallet(order, this.signer as TypedDataSigner, this.network);

		return `${rawSignature.slice(-2)}.${rawSignature.slice(2, 66)}.${rawSignature.slice(66, -2)}`.toUpperCase();
	}

	private async signOrderWithEoaWallet(order: OptionsOrderStruct, signer: TypedDataSigner, chainId: number) {
		const domain = {
			name: "Thea",
			version: "0.1",
			chainId: chainId
		};
		const types = {
			BtOptionOrder: [
				{ name: "orderId", type: "string" },
				{ name: "btOptionId", type: "string" },
				{ name: "quantity", type: "uint64" }
			]
		};
		const value = order;

		const rawSignatureFromEoaWallet = await signer._signTypedData(domain, types, value);

		return rawSignatureFromEoaWallet;
	}
}
