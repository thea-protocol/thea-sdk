import { consts, getAddress, typedDataSignerRequired } from "../utils";
import { Client, ProviderOrSigner, TheaNetwork } from "../types";
import { HttpClient } from "./shared";
import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";

export class Auth {
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;
	readonly signer: ProviderOrSigner;

	constructor(providerOrSigner: ProviderOrSigner, network: TheaNetwork) {
		this.httpClient = new HttpClient(consts[`${network}`].theaApiBaseUrl);
		this.network = network;
		this.signer = providerOrSigner;
	}

	/**
	 * Returns user profile on login
	 * @returns Client @see Client
	 */
	async login(): Promise<Client> {
		typedDataSignerRequired(this.signer);
		const ethAddr = await getAddress(this.signer as Signer);
		const challenge = await this.httpClient.post<{ ethAddr: string }, string>(`/requestSignLogin`, {
			ethAddr
		});
		const signature = await this.signChallenge(challenge);
		return this.httpClient.post<
			{
				challenge: string;
				signature: string;
			},
			Client
		>(`/signLogin`, {
			challenge,
			signature
		});
	}

	logout(): Promise<string> {
		return this.httpClient.post<null, string>(`/logout`, null);
	}

	private async signChallenge(challenge: string): Promise<string> {
		const rawSignature = await this.signChallengeWithEoaWallet(challenge, this.signer as TypedDataSigner, this.network);

		return rawSignature;
	}

	private async signChallengeWithEoaWallet(challenge: string, signer: TypedDataSigner, chainId: number) {
		const domain = {
			name: "Thea",
			version: "0.1",
			chainId: chainId
		};
		const types = {
			AuthMessage: [{ name: "content", type: "string" }]
		};
		const value = { content: challenge };

		const rawSignatureFromEoaWallet = await signer._signTypedData(domain, types, value);

		return rawSignatureFromEoaWallet;
	}
}
