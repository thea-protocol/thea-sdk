import {
	EIP712Signature,
	HttpResponseIn,
	IBaseTokenManagerContract,
	IRegistryContract,
	OffsetOrder,
	OffsetOrderNFT,
	OffsetOrderStripe,
	OrderRecordStatus,
	ProviderOrSigner,
	RelayerRequest,
	RequestId,
	TheaNetwork
} from "../types";
import {
	amountShouldBeGTZero,
	consts,
	ContractWrapper,
	Events,
	getAddress,
	getBalance,
	parseRawSignature,
	signerRequired,
	TheaError,
	validateAddress
} from "../utils";
import Registry_ABI from "../abi/Registry_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { approve, checkBalance, execute, executeWithResponse, HttpClient, permit, relay, TheaERC20 } from "./shared";
import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { Contract, ContractReceipt, Event } from "@ethersproject/contracts";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";

export class Offset extends ContractWrapper<IRegistryContract> {
	readonly baseTokenManager: IBaseTokenManagerContract;
	readonly httpClient: HttpClient;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Registry_ABI, consts[`${network}`].registryContract);
		this.baseTokenManager = new Contract(
			consts[`${network}`].baseTokenManagerContract,
			BaseTokenManager_ABI.abi,
			providerOrSigner
		) as IBaseTokenManagerContract;
		this.httpClient = new HttpClient(consts[`${network}`].theaApiBaseUrl);
	}

	/**
	 * Burns `amount` of VCC tokens of type `id` and emits event. Backend listens to event and retires the corresponding offchain VCCs
	 * @param tokenId - VCC token id
	 * @param amount - amount of VCC tokens to burn
	 * @param receiver - address for whom VCC will be offseted
	 * @returns Transaction receipt
	 */
	async offsetNFT(tokenId: BigNumberish, amount: BigNumberish, receiver?: string): Promise<ContractReceipt> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);
		await checkBalance(this.providerOrSigner as Signer, this.network, { token: "ERC1155", tokenId, amount });

		if (!receiver) receiver = await getAddress(this.providerOrSigner as Signer);
		validateAddress(receiver);

		const balance = await getBalance(this.providerOrSigner as Signer);

		const canSendTx = balance.gt(1e15);
		if (!canSendTx && consts[`${this.network}`].relayerUrl.length !== 0) {
			const request = await this.prepareRequest(tokenId, amount, 0, receiver);

			return relay(this.httpClient, this.contract.provider, request, {
				...this.contractDetails,
				contractFunction: "retireWithSig"
			});
		} else {
			await approve(this.providerOrSigner as Signer, this.network, {
				token: "ERC1155",
				spender: this.contractDetails.address
			});

			return execute(this.contract.retire(tokenId, amount, receiver), {
				...this.contractDetails,
				contractFunction: "retire"
			});
		}
	}

	/**
	 * Stores a request to retire with NBT token of `amount`, locks the NBT tokens and emits event.
	 * Backend listens to event and process the request. Tokens are not transferred until backend calls `closeRetireFungible`
	 * function after processing and validating the recovery and retire of VCC is successful.
	 * @param vintage - vintage of NBT token
	 * @param amount - amount of NBT token to retire
	 * @param tokenId - `ID` of VCC token to offset
	 * @returns RequestId & ContractReceipt  @see RequestId
	 */
	async offsetFungible(
		vintage: number,
		amount: BigNumberish,
		tokenId: BigNumberish = 0
	): Promise<ContractReceipt & RequestId> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		const address = await this.getBaseTokenAddressByVintage(vintage);

		const token = new TheaERC20(this.providerOrSigner, address);
		const owner = await getAddress(this.providerOrSigner as Signer);

		// Check balance
		await token.checkERC20Balance(owner, amount);

		// Approve
		await token.approveERC20(owner, this.contractDetails.address, amount);

		return executeWithResponse<RequestId>(
			this.contract.requestRetireFungible(vintage, amount, tokenId),
			{
				...this.contractDetails,
				contractFunction: "requestRetireFungible"
			},
			this.extractRequestIdFromEvent
		);
	}

	/**
	 * Callback function to extract request ID from the `UnwrapRequested` event
	 * @param events
	 * @returns @see RequestId
	 */
	extractRequestIdFromEvent(events?: Event[]): RequestId {
		const response: RequestId = { requestId: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.retireOffset);
			if (event) response.requestId = event.args?.requestId.toString();
		}

		return response;
	}

	/**
	 * Returns next offset event date
	 * @returns next offset event date
	 */
	getNextOffsetEventDate(): Promise<HttpResponseIn<string>> {
		return this.httpClient.get<HttpResponseIn<string>>("/nextRetirement");
	}

	async offsetHistory(): Promise<Record<"commited" | "retired", OffsetOrder[]>> {
		const offsetsFiat = await this.httpClient
			.post<Record<string, never>, HttpResponseIn<OffsetOrderStripe[]>>("/orders/list", {})
			.then((response) =>
				response.result.filter(
					(offset) => offset.postAction === "RETIRE" && offset.status === OrderRecordStatus.PERFORMED
				)
			)
			.then((result) =>
				result.map<OffsetOrder>((offset) => ({
					vccSpecRecord: offset.vccSpecRecord,
					txHash: offset.retireHash,
					dt: offset.created,
					ethAddr: offset.ethAddr,
					retiredAmount: offset.amount,
					orderSum: offset.orderSum
				}))
			);
		const offsetsNFT = await this.httpClient
			.post<Record<string, never>, HttpResponseIn<OffsetOrderNFT[]>>("/events/list", {})
			.then((response) => response.result)
			.then((result) =>
				result.map<OffsetOrder>((offset) => ({
					vccSpecRecord: offset.vccSpecRecord,
					txHash: offset.txHash,
					dt: offset.dt,
					ethAddr: offset.ethAddr,
					retiredAmount: offset.retiredAmount,
					orderSum: null
				}))
			);
		const txHashs = new Set(offsetsFiat.map((offset) => offset.txHash));
		return this.filterOffsetOrders([...offsetsFiat, ...offsetsNFT.filter((offset) => !txHashs.has(offset.txHash))]);
	}

	private filterOffsetOrders(orders: OffsetOrder[]): Record<"commited" | "retired", OffsetOrder[]> {
		return orders.reduce(
			(acc, cur: OffsetOrder) => {
				const orderDate = new Date(cur.dt);
				const now = new Date();
				if (now.getMonth() === orderDate.getMonth() && now.getFullYear() === orderDate.getFullYear()) {
					acc.commited.push(cur);
				} else {
					acc.retired.push(cur);
				}
				return acc;
			},
			{ commited: [], retired: [] } as Record<"commited" | "retired", OffsetOrder[]>
		);
	}

	private async getBaseTokenAddressByVintage(vintage: number): Promise<string> {
		const address = await this.baseTokenManager.baseTokens(vintage);
		if (BigNumber.from(address).isZero())
			throw new TheaError({ type: "TOKEN_NOT_FOUND", message: `Token by ${vintage} vintage not found` });

		return address;
	}

	private async prepareRequest(
		tokenId: BigNumberish,
		amount: BigNumberish,
		detailsId: BigNumberish,
		receiver: string
	): Promise<RelayerRequest> {
		const owner = await getAddress(this.providerOrSigner as Signer);

		const vccSig = await permit(this.providerOrSigner as Signer, this.network, {
			token: "ERC1155",
			spender: this.contractDetails.address
		});

		const retireSig = await this.retireWithSig(tokenId, amount, detailsId, receiver, owner);

		const encodedData = this.contract.interface.encodeFunctionData("retireWithSig", [
			tokenId,
			amount,
			detailsId,
			receiver,
			owner,
			retireSig,
			vccSig
		]);

		return { to: this.contractDetails.address, data: encodedData };
	}

	private async retireWithSig(
		tokenId: BigNumberish,
		amount: BigNumberish,
		detailsId: BigNumberish,
		receiver: string,
		owner: string
	): Promise<EIP712Signature> {
		const domain = {
			name: "TheaRegistry",
			version: "1",
			chainId: this.network,
			verifyingContract: this.contractDetails.address
		};

		const types = {
			RetireWithSig: [
				{ name: "tokenId", type: "uint256" },
				{ name: "amount", type: "uint256" },
				{ name: "detailsId", type: "uint256" },
				{ name: "receiver", type: "address" },
				{ name: "owner", type: "address" },
				{ name: "nonce", type: "uint256" },
				{ name: "deadline", type: "uint256" }
			]
		};

		const nonce = await this.contract.sigNonces(owner);
		const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

		const value = {
			tokenId,
			amount,
			detailsId,
			receiver,
			owner,
			nonce,
			deadline
		};

		const rawSignature = await (this.providerOrSigner as TypedDataSigner)._signTypedData(domain, types, value);

		const ecSignature = parseRawSignature(rawSignature);

		return { ...ecSignature, deadline };
	}
}
