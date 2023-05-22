import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { Contract, ContractReceipt } from "@ethersproject/contracts";
import { formatFixed, parseFixed } from "@ethersproject/bignumber";
import {
	OrderRecord,
	OrderCreateRequest,
	TheaNetwork,
	OrderRequest,
	OptionsOrderStruct,
	ProviderOrSigner,
	OptionsProduct,
	HttpResponseIn,
	OptionType
} from "../types";
import {
	amountShouldBeGTZero,
	consts,
	getAddress,
	getERC20ContractAddress,
	signerRequired,
	TheaError,
	typedDataSignerRequired
} from "../utils";
import { execute, HttpClient, TheaERC20 } from "./shared";
import TheaOptions_ABI from "../abi/TheaOptions_ABI.json";
import TheaOptionsVault_ABI from "../abi/TheaOptionsVault_ABI.json";
import { Quoter } from "./fungibleTrading";

export class Options {
	readonly quoter: Quoter;
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;
	readonly signer: ProviderOrSigner;

	constructor(signer: ProviderOrSigner, network: TheaNetwork) {
		this.quoter = new Quoter(signer, network);
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

		const optionsProduct = await this.httpClient
			.post<Record<string, never>, HttpResponseIn<OptionsProduct[]>>("/bt_options/list", {})
			.then((response) => response.result.find(({ uuid }) => uuid === btOptionId));

		if (!optionsProduct)
			throw new TheaError({ type: "INVALID_OPTION_PRODUCT_ID", message: "Options product id is invalid" });

		const optionsContract = new Contract(optionsProduct.contractAddr, TheaOptions_ABI.abi, this.signer);
		const optionsVault = new Contract(optionsProduct.vaultAddr, TheaOptionsVault_ABI.abi, this.signer);

		const parsedQuantity = parseFixed(quantity.toString(), 4);
		let depositAmount;
		let depositToken;
		if (optionsProduct.optionType === OptionType.Call) {
			depositAmount = parsedQuantity;
			depositToken = await optionsContract.baseToken();
		} else {
			depositAmount = parseFixed((quantity * optionsProduct.strike).toString(), 6);
			depositToken = await optionsContract.usdc();
		}

		const owner = await getAddress(this.signer as Signer);
		const token = new TheaERC20(this.signer, depositToken);
		await token.checkERC20Balance(owner, depositAmount);
		await token.approveERC20(owner, optionsProduct.vaultAddr, depositAmount);

		await execute(optionsVault.deposit(depositToken, depositAmount), {
			name: TheaOptionsVault_ABI.contractName,
			address: optionsProduct.vaultAddr,
			contractFunction: "deposit"
		});

		const response = await this.httpClient.post<{ btOptionId: string; quantity: number }, HttpResponseIn<OrderRequest>>(
			`/bt_options_orders/prepare`,
			{
				btOptionId,
				quantity
			}
		);
		const signedOrder = await this.signOrder({
			orderId: response.result.orderId,
			btOptionId,
			quantity: parsedQuantity.toString()
		});
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
		return this.httpClient
			.post<{ dtFrom: string }, HttpResponseIn<OptionsProduct[]>>("/bt_options/list", {
				dtFrom: new Date().toISOString()
			})
			.then((response) => response.result.filter(({ enabled }) => enabled).sort((a, b) => a.strike - b.strike))
			.then(async (activeProducts) => {
				const { tokenIn, tokenOut } = this.getTokenInAndOutAddress();
				const spot = await this.quoter.quoteBestPrice(tokenIn, tokenOut, 1e4);
				const callOption = this.closestStrike(
					parseFloat(formatFixed(spot, 6)),
					activeProducts.filter((option) => option.optionType === OptionType.Call)
				);
				const putOption = this.closestStrike(
					parseFloat(formatFixed(spot, 6)),
					activeProducts.filter((option) => option.optionType === OptionType.Put)
				);

				const products = [];
				if (callOption) products.push(callOption);
				if (putOption) products.push(putOption);
				return products;
			});
	}

	/**
	 * Returns current options strike and premium
	 * @param orderId - option ID
	 * @param btOptionId - option product ID
	 * @returns ContractReceipt @see ContractReceipt
	 */
	async exercise(orderId: string, btOptionId: string): Promise<ContractReceipt> {
		signerRequired(this.signer);
		const optionsProduct = await this.httpClient
			.post<Record<string, never>, HttpResponseIn<OptionsProduct[]>>("/bt_options/list", {})
			.then((response) => response.result.find(({ uuid }) => uuid === btOptionId));

		if (!optionsProduct)
			throw new TheaError({ type: "INVALID_OPTION_PRODUCT_ID", message: "Options product id is invalid" });

		const optionsContract = new Contract(optionsProduct.contractAddr, TheaOptions_ABI.abi, this.signer);
		const optionsVault = new Contract(optionsProduct.vaultAddr, TheaOptionsVault_ABI.abi, this.signer);

		const owner = await getAddress(this.signer as Signer);
		const baseToken = await optionsContract.baseToken();
		const usdc = await optionsContract.usdc();

		const txReceipt = await execute(optionsContract.exercise(orderId), {
			name: TheaOptions_ABI.contractName,
			address: optionsProduct.contractAddr,
			contractFunction: "exercise"
		});

		const balanceBT = await optionsVault.balanceOf(owner, baseToken);
		const balanceUsdc = await optionsVault.balanceOf(owner, usdc);

		if (!balanceBT.isZero()) await optionsVault.withdraw(baseToken, balanceBT);
		if (!balanceUsdc.isZero()) await optionsVault.withdraw(usdc, balanceUsdc);

		return txReceipt;
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

	private closestStrike(target: number, products: OptionsProduct[]): OptionsProduct {
		let closestProduct = products[0];
		let closestDifference = Math.abs(target - closestProduct.strike);

		products.forEach((product) => {
			const currentDifference = Math.abs(target - product.strike);

			if (currentDifference < closestDifference) {
				closestProduct = product;
				closestDifference = currentDifference;
			}
		});

		return closestProduct;
	}

	/**
	 * Determines tokenIn and tokenOut address for querying current NBT price.
	 * @returns tokenIn and tokenOut address
	 */
	private getTokenInAndOutAddress(): {
		tokenIn: string;
		tokenOut: string;
	} {
		const stableTokenAddress = consts[`${this.network}`].stableTokenContract;
		const tokenInAddress = getERC20ContractAddress("CurrentNBT", this.network);
		const tokenOutAddress = stableTokenAddress;
		return { tokenIn: tokenInAddress, tokenOut: tokenOutAddress };
	}
}
