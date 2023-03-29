import {
	ProviderOrSigner,
	IBaseTokenManagerContract,
	RecoverEvent,
	BaseTokenCharactaristics,
	BaseTokenAmounts,
	TheaNetwork,
	RelayerRequest,
	EIP712Signature
} from "../types";
import {
	ContractWrapper,
	RATE_VCC_TO_BT,
	signerRequired,
	Events,
	consts,
	amountShouldBeGTZero,
	getAddress,
	parseRawSignature,
	getBalance
} from "../utils";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt, Event } from "@ethersproject/contracts";
import { approve, checkBalance, executeWithResponse, HttpClient, permit, relayWithResponse } from "./shared";
import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { formatBytes32String } from "@ethersproject/strings";
import { defaultAbiCoder } from "@ethersproject/abi";
import { GetCharacteristicsBytes } from "./getCharacteristicsBytes";
import { Log } from "@ethersproject/providers";

export class Recover extends ContractWrapper<IBaseTokenManagerContract> {
	readonly httpClient: HttpClient;
	constructor(
		readonly providerOrSigner: ProviderOrSigner,
		readonly network: TheaNetwork,
		readonly registry: GetCharacteristicsBytes
	) {
		super(providerOrSigner, BaseTokenManager_ABI, consts[`${network}`].baseTokenManagerContract);
		this.httpClient = new HttpClient(consts[`${network}`].relayerUrl, false);
		this.registry = registry;
	}

	/**
	 * Stores a request to reccove the VCC NFT token of type `id` from Base Tokens, unlocks the NFT and burns BaseTokens based on 'amount' sent and emits event.
	 * @param tokenId id of the VCC token
	 * @param amount amount of tokens to recover
	 * @returns A promise fulfilled with the contract transaction.
	 */
	async recoverNFT(tokenId: BigNumberish, amount: BigNumberish): Promise<ContractReceipt & RecoverEvent> {
		signerRequired(this.providerOrSigner);
		amountShouldBeGTZero(amount);

		const baseTokenCharactaristics = await this.contract.baseCharacteristics();
		const btAmount = await this.calculateBaseTokensAmounts(tokenId, amount, baseTokenCharactaristics);

		await this.checkBalancesForAllBaseTokens(btAmount);

		const balance = await getBalance(this.providerOrSigner as Signer);

		const canSendTx = balance.gt(1e15);
		if (!canSendTx && consts[`${this.network}`].relayerUrl.length !== 0) {
			const permits = await this.permitAllBaseTokens(btAmount);
			const request = await this.prepareRequest(tokenId, amount, permits);

			return relayWithResponse<RecoverEvent>(
				this.httpClient,
				this.contract.provider,
				request,
				{
					...this.contractDetails,
					contractFunction: "recoverWithSig"
				},
				this.extractInfoFromLog
			);
		} else {
			await this.approveAllBaseTokens(btAmount);

			return executeWithResponse<RecoverEvent>(
				this.contract.recover(tokenId, amount),
				{
					...this.contractDetails,
					contractFunction: "recover"
				},
				this.extractInfoFromEvent
			);
		}
	}

	async queryRecoverFungibles(tokenId: BigNumberish, amount: BigNumberish): Promise<BaseTokenAmounts> {
		const baseTokenCharactaristics = await this.contract.baseCharacteristics();
		const btAmount = await this.calculateBaseTokensAmounts(tokenId, amount, baseTokenCharactaristics);
		return {
			cbt: btAmount.cbt.toString(),
			sdg: btAmount.sdg.toString(),
			vintage: btAmount.vintage.toString(),
			rating: btAmount.rating.toString()
		};
	}

	async checkBalancesForAllBaseTokens(btAmount: BaseTokenAmounts) {
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.cbt,
			tokenName: "CurrentNBT"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.sdg,
			tokenName: "SDG"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.vintage,
			tokenName: "Vintage"
		});
		await checkBalance(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			amount: btAmount.rating,
			tokenName: "Rating"
		});
	}

	async approveAllBaseTokens(btAmount: BaseTokenAmounts) {
		const spender = this.contractDetails.address;
		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.cbt,
			tokenName: "CurrentNBT"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.sdg,
			tokenName: "SDG"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.vintage,
			tokenName: "Vintage"
		});

		await approve(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.rating,
			tokenName: "Rating"
		});
	}

	async permitAllBaseTokens(btAmount: BaseTokenAmounts): Promise<EIP712Signature[]> {
		const spender = this.contractDetails.address;
		const permits: EIP712Signature[] = [];

		await permit(this.providerOrSigner as Signer, this.network, {
			token: "ERC20",
			spender,
			amount: btAmount.cbt,
			tokenName: "CurrentNBT"
		}).then((sig) => permits.push(sig));

		if (!BigNumber.from(btAmount.sdg).isZero()) {
			await permit(this.providerOrSigner as Signer, this.network, {
				token: "ERC20",
				spender,
				amount: btAmount.sdg,
				tokenName: "SDG"
			}).then((sig) => permits.push(sig));
		}

		if (!BigNumber.from(btAmount.vintage).isZero()) {
			await permit(this.providerOrSigner as Signer, this.network, {
				token: "ERC20",
				spender,
				amount: btAmount.vintage,
				tokenName: "Vintage"
			}).then((sig) => permits.push(sig));
		}

		if (!BigNumber.from(btAmount.rating).isZero()) {
			await permit(this.providerOrSigner as Signer, this.network, {
				token: "ERC20",
				spender,
				amount: btAmount.rating,
				tokenName: "Rating"
			}).then((sig) => permits.push(sig));
		}

		return permits;
	}

	//returns object with sdg, vintage and rating amounts
	async calculateBaseTokensAmounts(
		id: BigNumberish,
		amount: BigNumberish,
		baseTokenCharactaristics: BaseTokenCharactaristics
	): Promise<{ cbt: BigNumber; sdg: BigNumber; vintage: BigNumber; rating: BigNumber }> {
		const unitAmount = BigNumber.from(amount).mul(RATE_VCC_TO_BT);
		const { sdgValue, vintageValue, ratingValue } = await this.getFeatureValue(id);

		const sdgAmount = BigNumber.from(unitAmount).mul(sdgValue.sub(baseTokenCharactaristics.sdgsCount));
		const vintageAmount = BigNumber.from(unitAmount).mul(vintageValue.sub(baseTokenCharactaristics.vintage));
		const ratingAmount = BigNumber.from(unitAmount).mul(ratingValue.sub(baseTokenCharactaristics.rating));

		return { cbt: unitAmount, sdg: sdgAmount, vintage: vintageAmount, rating: ratingAmount };
	}

	async getFeatureValue(
		id: BigNumberish
	): Promise<{ vintageValue: BigNumber; sdgValue: BigNumber; ratingValue: BigNumber }> {
		const keys = [formatBytes32String("vintage"), formatBytes32String("sdgs_count"), formatBytes32String("rating")];
		const bytes = await this.registry.getCharacteristicsBytes(id, keys);
		const values = defaultAbiCoder.decode(["uint256", "uint256", "uint256"], bytes);
		return { vintageValue: values[0], sdgValue: values[1], ratingValue: values[2] };
	}

	extractInfoFromEvent(events?: Event[]): RecoverEvent {
		const response: RecoverEvent = { id: undefined, amount: undefined };
		if (events) {
			const event = events.find((event) => event.event === Events.recover);
			if (event) {
				response.id = event.args?.tokenId.toString();
				response.amount = event.args?.amount.toString();
			}
		}

		return response;
	}

	extractInfoFromLog(logs?: Log[]): RecoverEvent {
		const logDesc = logs
			?.filter((log) => log.address === this.contractDetails.address)
			.map((log) => this.contract.interface.parseLog(log));
		const response: RecoverEvent = { id: undefined, amount: undefined };
		if (logDesc) {
			const log = logDesc.find((log) => log.name === Events.recover);
			if (log) {
				response.id = log.args?.tokenId.toString();
				response.amount = log.args?.amount.toString();
			}
		}

		return response;
	}

	private async prepareRequest(
		id: BigNumberish,
		amount: BigNumberish,
		permits: EIP712Signature[]
	): Promise<RelayerRequest> {
		const owner = await getAddress(this.providerOrSigner as Signer);

		const recoverSig = await this.recoverWithSig(id, amount, owner);

		const encodedData = this.contract.interface.encodeFunctionData("recoverWithSig", [
			id,
			amount,
			owner,
			recoverSig,
			permits
		]);

		return { to: this.contractDetails.address, data: encodedData };
	}

	private async recoverWithSig(id: BigNumberish, amount: BigNumberish, owner: string): Promise<EIP712Signature> {
		const domain = {
			name: "TheaBaseTokenManager",
			version: "1",
			chainId: this.network,
			verifyingContract: this.contractDetails.address
		};

		const types = {
			RecoverWithSig: [
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
