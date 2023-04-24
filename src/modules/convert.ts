import {
	ProviderOrSigner,
	IBaseTokenManagerContract,
	ConvertEvent,
	TheaNetwork,
	RelayerRequest,
	EIP712Signature
} from "../types";
import {
	ContractWrapper,
	signerRequired,
	Events,
	consts,
	amountShouldBeGTZero,
	parseRawSignature,
	getAddress,
	getBalance
} from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse, HttpClient, permit, relayWithResponse } from "./shared";
import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { Log } from "@ethersproject/providers";

export class Convert extends ContractWrapper<IBaseTokenManagerContract> {
	readonly httpClient: HttpClient;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, BaseTokenManager_ABI, consts[`${network}`].baseTokenManagerContract);
		this.httpClient = new HttpClient(consts[`${network}`].relayerUrl, false);
	}

	/**
	 * Stores a request to convert the VCC NFT token of type `id`, locks the tokens and sends caller BaseTokens based on 'amount' sent and emits event.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to convert
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async convertNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt & ConvertEvent> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		await checkBalance(this.providerOrSigner as Signer, this.network, { token: "ERC1155", tokenId, amount });

		const balance = await getBalance(this.providerOrSigner as Signer);

		const canSendTx = balance.gt(1e15);
		if (!canSendTx && consts[`${this.network}`].relayerUrl.length !== 0) {
			const request = await this.prepareRequest(tokenId, amount);
			return relayWithResponse<ConvertEvent>(
				this.httpClient,
				this.contract.provider,
				request,
				{
					...this.contractDetails,
					contractFunction: "convertWithSig"
				},
				this.extractIdAndAmountFromLog
			);
		} else {
			await approve(this.providerOrSigner as Signer, this.network, {
				token: "ERC1155",
				spender: this.contractDetails.address
			});

			return executeWithResponse<ConvertEvent>(
				this.contract.convert(tokenId, amount),
				{
					...this.contractDetails,
					contractFunction: "convert"
				},
				this.extractIdAndAmountFromEvent
			);
		}
	}

	extractIdAndAmountFromEvent(events?: Event[]): ConvertEvent {
		const response: ConvertEvent = { id: undefined, amount: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.convert);
			if (event) {
				response.id = event.args?.tokenId.toString();
				response.amount = event.args?.amount.toString();
			}
		}

		return response;
	}

	extractIdAndAmountFromLog(logs?: Log[]): ConvertEvent {
		const logDesc = logs
			?.filter((log) => log.address === this.contractDetails.address)
			.map((log) => this.contract.interface.parseLog(log));
		const response: ConvertEvent = { id: undefined, amount: undefined };
		if (logDesc) {
			const log = logDesc.find((log) => log.name === Events.convert);
			if (log) {
				response.id = log.args.tokenId.toString();
				response.amount = log.args.amount.toString();
			}
		}

		return response;
	}

	async prepareRequest(id: BigNumberish, amount: BigNumberish): Promise<RelayerRequest> {
		const owner = await getAddress(this.providerOrSigner as Signer);

		const vccSig = await permit(this.providerOrSigner as Signer, this.network, {
			token: "ERC1155",
			spender: this.contractDetails.address
		});

		const convertSig = await this.convertWithSig(id, amount, owner);

		const encodedData = this.contract.interface.encodeFunctionData("convertWithSig", [
			id,
			amount,
			owner,
			convertSig,
			vccSig
		]);

		return { to: this.contractDetails.address, data: encodedData };
	}

	private async convertWithSig(id: BigNumberish, amount: BigNumberish, owner: string): Promise<EIP712Signature> {
		const domain = {
			name: "TheaBaseTokenManager",
			version: "1",
			chainId: this.network,
			verifyingContract: this.contractDetails.address
		};

		const types = {
			ConvertWithSig: [
				{ name: "id", type: "uint256" },
				{ name: "amount", type: "uint256" },
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
			owner,
			nonce,
			deadline
		};

		const rawSignature = await (this.providerOrSigner as TypedDataSigner)._signTypedData(domain, types, value);

		const ecSignature = parseRawSignature(rawSignature);

		return { ...ecSignature, deadline };
	}
}
