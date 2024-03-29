import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { Provider, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
	Convert,
	GetCharacteristicsBytes,
	GetTokenList,
	Recover,
	Tokenization,
	Unwrap,
	FungibleTrading,
	Orderbook,
	NFTTrading,
	Offset,
	CarbonInfo,
	RollBaseTokens,
	Options,
	Auth
} from "../modules";
import { TheaNetwork, ProviderOrSigner } from "../types";
import { consts, getCurrentNBTTokenAddress, isProvider, isSigner, TheaError, validateAddress } from "../utils";

// SDK initialization options
export type InitOptions = {
	network: TheaNetwork;
	provider?: Provider;
	privateKey?: string;
	signer?: Signer;
	web3Provider?: Web3Provider;
	currentNBTokenAddress?: string;
};

export class TheaSDK {
	readonly unwrap: Unwrap;
	readonly tokenization: Tokenization;
	readonly convert: Convert;
	readonly offset: Offset;
	readonly recover: Recover;
	readonly fungibleTrading: FungibleTrading;
	readonly nftTokenList: GetTokenList;
	readonly nftOrderbook: Orderbook;
	readonly nftTrading: NFTTrading;
	readonly carbonInfo: CarbonInfo;
	readonly rollBaseTokens: RollBaseTokens;
	readonly options: Options;
	readonly auth: Auth;

	private constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.unwrap = new Unwrap(this.providerOrSigner, network);
		this.convert = new Convert(this.providerOrSigner, network);
		this.offset = new Offset(this.providerOrSigner, network);
		const registry = new GetCharacteristicsBytes(this.providerOrSigner, network);
		this.recover = new Recover(this.providerOrSigner, network, registry);
		this.fungibleTrading = new FungibleTrading(this.providerOrSigner, network);
		this.nftTokenList = new GetTokenList(network);
		this.nftOrderbook = new Orderbook(network);
		this.nftTrading = new NFTTrading(this.providerOrSigner, network, this.nftOrderbook);
		this.rollBaseTokens = new RollBaseTokens(this.providerOrSigner, network);
		this.carbonInfo = new CarbonInfo(this.providerOrSigner, network);
		this.tokenization = new Tokenization(network);
		this.options = new Options(this.providerOrSigner, network);
		this.auth = new Auth(this.providerOrSigner, network);
	}

	/**
	 * Function to initialize TheaSDK. It accepts a variety of options to instantiate provider or signer which will be used
	 * to call Thea protocol.
	 * @param options.network Thea network to connect to @see TheaNetwork
	 * @param options.provider Any ethers provider
	 * @param options.privateKey Private key for instantiating a wallet
	 * @param options.signer Passed as ethers.Signer (ethers.Wallet)
	 * @param options.web3Provider Web3 provider
	 * @returns Initialized TheaSDK instance
	 */
	static async init(options: InitOptions): Promise<TheaSDK> {
		let providerOrSigner: ProviderOrSigner;

		if (options.web3Provider) providerOrSigner = options.web3Provider.getSigner() as Signer & TypedDataSigner;
		else if (options.signer) {
			if (!options.signer.provider)
				throw new TheaError({ type: "SIGNER_REQUIRES_PROVIDER", message: "Signer must be have provider" });
			providerOrSigner = options.signer;
		} else if (options.privateKey) {
			if (!options.provider) {
				throw new TheaError({
					type: "MISSING_PROVIDER",
					message: "You must pass in a provider together with private key"
				});
			}
			providerOrSigner = new Wallet(options.privateKey, options.provider);
		} else if (options.provider) providerOrSigner = options.provider;
		else throw new TheaError({ type: "EMPTY_OPTIONS", message: "Non of optional parameters were provided" });

		let providerNetwork;
		if (isSigner(providerOrSigner)) {
			const chainId = await (providerOrSigner as Signer).getChainId();
			providerNetwork = chainId;
		} else if (isProvider(providerOrSigner)) {
			const { chainId } = await (providerOrSigner as Provider).getNetwork();
			providerNetwork = chainId;
		}

		if (providerNetwork != options.network)
			throw new TheaError({
				type: "NETWORK_MISMATCH",
				message: `Provided network is ${options.network} but provider is connected to ${providerNetwork} network`
			});

		if (options.currentNBTokenAddress) {
			consts[`${options.network}`].currentNbtTokenContract = options.currentNBTokenAddress;
		} else {
			consts[`${options.network}`].currentNbtTokenContract = await getCurrentNBTTokenAddress(
				options.network,
				providerOrSigner
			);
		}
		return new TheaSDK(providerOrSigner, options.network);
	}

	setCurrentNBTContractAddress = (address: string) => {
		validateAddress(address);
		consts[`${this.network}`].currentNbtTokenContract = address;
	};
}
