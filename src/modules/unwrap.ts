import {
	ProviderOrSigner,
	IRegistryContract,
	UnwrapTokenState,
	RequestId,
	TheaNetwork,
	RelayerRequest,
	EIP712Signature
} from "../types";
import {
	consts,
	ContractWrapper,
	Events,
	getAddress,
	getBalance,
	parseRawSignature,
	signerRequired,
	TheaError,
	tokenAmountShouldBeTon
} from "../utils";
import Registry_ABI from "../abi/Registry_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse, HttpClient, permit, relayWithResponse } from "./shared";
import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { Log } from "@ethersproject/providers";

export class Unwrap extends ContractWrapper<IRegistryContract> {
	readonly httpClient: HttpClient;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Registry_ABI, consts[`${network}`].registryContract);
		this.httpClient = new HttpClient(consts[`${network}`].relayerUrl, false);
	}

	/**
	 * Stores a request to untokenize the VCC token of type `id`, locks the tokens and emits event. Backend listens to event and process the request.
	 * Tokens are not burnt until backend calls `updateUnwrapRequest` function after processing and validating the transfer to offchain `offchainAccount` was succesful.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to unwrap
	 * @param offchainAccount offchain account to transfer the tokens to
	 * @returns RequestId & ContractReceipt  @see RequestId
	 */
	async unwrapToken(
		tokenId: BigNumberish,
		amount: BigNumberish,
		offchainAccount: string
	): Promise<ContractReceipt & RequestId> {
		signerRequired(this.providerOrSigner);
		tokenAmountShouldBeTon(amount);

		await checkBalance(this.providerOrSigner as Signer, this.network, { token: "ERC1155", tokenId, amount });

		const balance = await getBalance(this.providerOrSigner as Signer);

		const canSendTx = balance.gt(1e15);
		if (!canSendTx && consts[`${this.network}`].relayerUrl.length !== 0) {
			const request = await this.prepareRequest(tokenId, amount, offchainAccount);

			return relayWithResponse<RequestId>(
				this.httpClient,
				this.contract.provider,
				request,
				{
					...this.contractDetails,
					contractFunction: "unwrapWithSig"
				},
				this.extractRequestIdFromLog
			);
		} else {
			await approve(this.providerOrSigner as Signer, this.network, {
				token: "ERC1155",
				spender: this.contractDetails.address
			});

			return executeWithResponse<RequestId>(
				this.contract.unwrap(tokenId, amount, offchainAccount),
				{
					...this.contractDetails,
					contractFunction: "unwrap"
				},
				this.extractRequestIdFromEvent
			);
		}
	}

	/**
	 * Returns the state of the unwrap token request. It calls the `requests` mapping of the Registry contract.
	 * @param `requestId` id of the request
	 * @returns UnwrapTokenState @see UnwrapTokenState
	 */
	async getUnwrapTokenState(requestId: BigNumberish): Promise<UnwrapTokenState> {
		this.requestIdShouldBeGTZero(requestId);
		const { status, maker, tokenId, amount } = await this.contract.requests(requestId);
		return {
			status,
			maker,
			tokenId: tokenId.toString(),
			amount: amount.toString()
		};
	}

	/**
	 * Validates value of `requestId` which needs to be at least 1
	 * @param requestId value to be checked
	 */
	private requestIdShouldBeGTZero(requestId: BigNumberish): void {
		const requestIdBigNumber = BigNumber.from(requestId);
		if (requestIdBigNumber.lte(0)) {
			throw new TheaError({
				type: "INVALID_REQUEST_ID_VALUE",
				message: "Request id should be greater than 0"
			});
		}
	}

	/**
	 * Callback function to extract request ID from the `UnwrapRequested` event
	 * @param events
	 * @returns @see RequestId
	 */
	extractRequestIdFromEvent(events?: Event[]): RequestId {
		const response: RequestId = { requestId: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.unwrap);
			if (event) response.requestId = event.args?.requestId.toString();
		}

		return response;
	}

	extractRequestIdFromLog(logs?: Log[]): RequestId {
		const logDesc = logs
			?.filter((log) => log.address === this.contractDetails.address)
			.map((log) => this.contract.interface.parseLog(log));
		const response: RequestId = { requestId: undefined };
		if (logDesc) {
			const log = logDesc.find((log) => log.name === Events.unwrap);
			if (log) response.requestId = log.args?.requestId.toString();
		}

		return response;
	}

	private async prepareRequest(
		id: BigNumberish,
		amount: BigNumberish,
		offchainAccount: string
	): Promise<RelayerRequest> {
		const owner = await getAddress(this.providerOrSigner as Signer);

		const vccSig = await permit(this.providerOrSigner as Signer, this.network, {
			token: "ERC1155",
			spender: this.contractDetails.address
		});

		const unwrapSig = await this.unwrapWithSig(id, amount, offchainAccount, owner);

		const encodedData = this.contract.interface.encodeFunctionData("unwrapWithSig", [
			id,
			amount,
			offchainAccount,
			owner,
			unwrapSig,
			vccSig
		]);

		return { to: this.contractDetails.address, data: encodedData };
	}

	private async unwrapWithSig(
		id: BigNumberish,
		amount: BigNumberish,
		offchainAccount: string,
		owner: string
	): Promise<EIP712Signature> {
		const domain = {
			name: "TheaRegistry",
			version: "1",
			chainId: this.network,
			verifyingContract: this.contractDetails.address
		};

		const types = {
			UnwrapWithSig: [
				{ name: "id", type: "uint256" },
				{ name: "amount", type: "uint256" },
				{ name: "offchainAccount", type: "string" },
				{ name: "owner", type: "address" },
				{ name: "nonce", type: "uint256" },
				{ name: "deadline", type: "uint256" }
			]
		};

		const nonce = await this.contract.sigNonces(owner);
		const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

		const value = {
			id,
			amount,
			offchainAccount,
			owner,
			nonce,
			deadline
		};

		const rawSignature = await (this.providerOrSigner as TypedDataSigner)._signTypedData(domain, types, value);

		const ecSignature = parseRawSignature(rawSignature);

		return { ...ecSignature, deadline };
	}
}
