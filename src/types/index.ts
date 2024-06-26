import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Provider } from "@ethersproject/providers";
import {
	ISO_CODES,
	bikeTypeOptions,
	classEmissionFactorOptions,
	currencyFactorOptions,
	dietStyleOptions,
	durationFactorOptions
} from "../utils";

export enum TheaNetwork {
	GANACHE = 1337,
	MUMBAI = 80001,
	POLYGON = 137,
	HAQQ_TESTNET = 54211 // TESTNET
}

export type ProviderOrSigner = Provider | Signer | (Signer & TypedDataSigner);
export enum TokenStatus {
	PENDING,
	ACCEPTED,
	REJECTED
}
export type UnwrapTokenState = {
	status: TokenStatus;
	maker: string;
	tokenId: string;
	amount: string;
};
export type ContractDetails = {
	name: string;
	address: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type TheaERC20Token = "SDG" | "Vintage" | "Rating" | "CurrentNBT" | "Stable";

export type ExactInputSingleParams = {
	tokenIn: string;
	tokenOut: string;
	fee: BigNumberish;
	recipient: string;
	deadline: BigNumberish;
	amountIn: BigNumberish;
	amountOutMinimum: BigNumberish;
};

export type FungibleERC20Options = {
	tokenIn: TheaERC20Token;
	amountIn: BigNumberish;
};

export type FungibleStableOptions = {
	tokenIn: "Stable";
	amountIn: BigNumberish;
	tokenOut: TheaERC20Token;
};

export const POOL_FEE = 3000;
export type FungibleOptions = FungibleERC20Options | FungibleStableOptions;
export type SwapOptions = {
	slippageTolerance?: number;
	deadline?: number; // Unix timestamp
	recipient?: string;
};
export type RequestId = { requestId?: string };

export enum TokenizationStatus {
	IN_QUEUE = "IN_QUEUE",
	BC_PRE_PENDING = "BC_PRE_PENDING",
	BC_PENDING = "BC_PENDING",
	INTERACTING_WITH_VCC_SERVICE = "INTERACTING_WITH_VCC_SERVICE",
	PERSISTING = "PERSISTING",
	VALIDATING = "VALIDATING",
	VALIDATED = "VALIDATED",
	PAYMENT_REQUESTED = "PAYMENT_REQUESTED",
	PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
	ERROR_PAYMENT_TIMEOUT = "ERROR_PAYMENT_TIMEOUT",
	REFUND_REQUESTED = "REFUND_REQUESTED",
	REFUND_SENT = "REFUND_SENT",
	TRANSFER_REQUESTED = "TRANSFER_REQUESTED",
	VCC_VALIDATION = "VCC_VALIDATION",
	CLIENT_CONFIRMATION = "CLIENT_CONFIRMATION",
	WAITING_VCC_TRANSFER = "WAITING_VCC_TRANSFER",
	VCC_TRANSFER_VALIDATION = "VCC_TRANSFER_VALIDATION",
	ERROR_REJECTED = "ERROR_REJECTED",
	ERROR_INVALID_INPUT = "ERROR_INVALID_INPUT",
	ERROR_GENERAL = "ERROR_GENERAL",
	ERROR_VALIDATION = "ERROR_VALIDATION",
	ERROR_ON_BC_SEND = "ERROR_ON_BC_SEND",
	ERROR_BC_CONFIRMED_BUT_FAILED = "ERROR_BC_CONFIRMED_BUT_FAILED",
	ERROR_ON_VCC_SERVICE_INTERACTION = "ERROR_ON_VCC_SERVICE_INTERACTION",
	ERROR_VCC_SOURCE_EXISTS = "ERROR_VCC_SOURCE_EXISTS",
	ERROR_VCC_SOURCE_CONFLICT = "ERROR_VCC_SOURCE_CONFLICT",
	ERROR_PENDING_TIMEOUT = "ERROR_PENDING_TIMEOUT",
	ERROR_TRANSFER_FAILED = "ERROR_TRANSFER_FAILED",
	PERFORMED = "PERFORMED"
}
export enum TokenizationSource {
	VERRA = "verra"
}
export enum TokenizationError {
	GENERAL_ERROR = "GENERAL_ERROR",
	BAD_INPUT_DATA = "BAD_INPUT_DATA",
	NO_AUTH = "NO_AUTH",
	BAD_CREDS = "BAD_CREDS",
	RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
	RECORD_EXISTS = "RECORD_EXISTS",
	RECORD_CONFLICT = "RECORD_CONFLICT",
	PASSPOLICY_ERROR = "PASSPOLICY_ERROR",
	NO_PRIVS = "NO_PRIVS",
	REFERRED_RECORDS_DETECTED = "REFERRED_RECORDS_DETECTED",
	ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
	DOCUSIGN_ERROR = "DOCUSIGN_ERROR",
	UNABLE_TO_GET_RATING = "UNABLE_TO_GET_RATING",
	VERRA_INTERACTION_ERROR = "VERRA_INTERACTION_ERROR"
}
export type TokenizationState = {
	result: {
		uuid: string;
		createdAt: string;
		updatedAt: string;
		email: string;
		fullName: string;
		ethAddr: string;
		source: TokenizationSource;
		subaccountId: string;
		batchId: string;
		status: TokenizationStatus;
		specInfo: string | null;
		statusMess: string | null;
		transferId: string | null;
		signProcId: string | null;
		signDocPdf: string[] | null;
		signCertPdf: string[] | null;
	} | null;
	error: TokenizationError | null;
	errorMessage: string | null;
};
export type ClientDetails = {
	email: string;
	ethAddr: string;
	fullName: string;
};

export type TokenizationRequest = ClientDetails & {
	source: TokenizationSource;
	subacconuntId: string;
	batchId: string;
};

export type ConvertEvent = { id?: string; amount?: string };
export type RecoverEvent = { id?: string; amount?: string };
export type RollTokensEvent = { user?: string; vintage?: string; amount?: string };

export type BaseTokenCharactaristics = {
	vintage: BigNumber;
	sdgsCount: BigNumber;
	rating: BigNumber;
};

export type BaseTokenAmounts = {
	cbt: BigNumberish;
	sdg: BigNumberish;
	vintage: BigNumberish;
	rating: BigNumberish;
};

export type Co2DataSet = {
	[key in ISO_CODES]: {
		country: string;
		isoCode: ISO_CODES;
		data: { year: number; co2_per_capita?: number }[];
	};
};
export type FootprintQuery = {
	isoCode: ISO_CODES;
	year: number | null;
};

export type FootprintSummary = {
	country: string;
	isoCode: ISO_CODES;
	from: number;
	to: number;
	co2Emission: number;
};
export type FootprintDetail = {
	year: number;
	co2Emission: number;
	country: string;
	isoCode: string;
};
export type EstimatedFootprint = {
	footprint: number;
	summary: FootprintSummary[];
	details: FootprintDetail[];
	bespokeAddOns: {
		villages: Array<Village & { footprint: number }>;
		familyMembers: number[];
		total: number;
	};
};
/* eslint-disable  @typescript-eslint/no-explicit-any */
export type GraphqlQuery = {
	query: string;
	variables?: { [key: string]: any };
};

export type QueryResponse<T> = { data: T };
export type QueryError = Record<string, any>;
export type QueryErrorResponse = { errors: QueryError[] };

export type TokenizationHistory = {
	id: string;
	projectId: string;
	vintage: string;
};
export type TokenInfo = {
	id: string;
	unwrappedAmount: string;
	vintage: string;
	activeAmount: string;
	mintedAmount: string;
	projectId: string;
	retiredAmount: string;
	tokenURI: string;
};

export type TokenizationStats = TokenInfo | null;

export type OffsetHistory = {
	id: string;
	amount: string;
	timestamp: string;
	by: {
		id: string;
	};
};
export type OffsetStats = {
	id: string;
	amount: string;
	timestamp: string;
	by: {
		id: string;
	};
	token: TokenizationStats;
} | null;

export type TheaERC1155Balance = {
	amount: string;
	token: {
		id: string;
	};
};
export type OptionsVaultBalance = {
	amount: string;
	token: {
		id: string;
		symbol: string;
	};
};
export type UserBalance = {
	optionsDeposit: Record<string, string>;
	fungible: {
		vintage: string;
		rating: string;
		sdg: string;
		nbt: string;
		stable: string;
	};
	nft: Record<string, string>;
};
export enum API_RESPONSE_ERROR {
	GENERAL_ERROR = "GENERAL_ERROR",
	BAD_INPUT_DATA = "BAD_INPUT_DATA",
	NO_AUTH = "NO_AUTH",
	BAD_CREDS = "BAD_CREDS",
	RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
	RECORD_EXISTS = "RECORD_EXISTS",
	RECORD_CONFLICT = "RECORD_CONFLICT",
	PASSPOLICY_ERROR = "PASSPOLICY_ERROR",
	NO_PRIVS = "NO_PRIVS",
	REFERRED_RECORDS_DETECTED = "REFERRED_RECORDS_DETECTED",
	ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
	DOCUSIGN_ERROR = "DOCUSIGN_ERROR",
	UNABLE_TO_GET_RATING = "UNABLE_TO_GET_RATING",
	VERRA_INTERACTION_ERROR = "VERRA_INTERACTION_ERROR",
	INSUFFICIENT_AMOUNT = "INSUFFICIENT_AMOUNT",
	INVALID_SIGNATURE = "INVALID_SIGNATURE",
	IPFS_INTERACTION_ERROR = "IPFS_INTERACTION_ERROR"
}
export interface HttpResponseIn<T = any> {
	result: T;
	error: API_RESPONSE_ERROR | null;
	errorMessage: string | null;
}
export type TokenInfoList = {
	id: number;
	spec: string;
	price: number;
	availableAmount: number;
};
export type Loyalty = {
	badges: Array<string>;
	tier: number;
};
export enum ChangeType {
	extend = "extend",
	expire = "expire",
	increment = "increment",
	convert = "convert",
	buy = "buy",
	recover = "recover",
	sell = "sell",
	offset = "offset"
}
export type RpChange = {
	changeDate: string;
	changeType: ChangeType;
	expiry: string;
	amount: number;
	earningEvent: string;
};
export type TierChange = {
	changeDate: string;
	prevTier: number;
	newTier: number;
};
export type PositionChange = {
	changeDate: string;
	changeType: ChangeType;
	amount: number;
};
export type ClientProfile = {
	userID: string;
	walletAddress: string;
	uniqueReferralCode: string;
	active: boolean;
	referrerID: string | null;
	loyalty: Loyalty;
	bridgingBonusPaid: boolean;
	offsetBonusPaid: boolean;
	outstandingReferrals: Record<string, number>;
	currentRpBalance: Record<string, number>;
	historicRpChanges: Array<RpChange>;
	historicTierChanges: Array<TierChange>;
	historicPositionChanges: Array<PositionChange> | null;
	totalRetiredAmount: number;
	invitations: number;
};
export enum OrderRecordStatus {
	REQUESTED = "REQUESTED",
	IN_QUEUE = "IN_QUEUE",
	BC_PRE_PENDING = "BC_PRE_PENDING",
	BC_PENDING = "BC_PENDING",
	INTERACTING_WITH_VCC_SERVICE = "INTERACTING_WITH_VCC_SERVICE",
	PERSISTING = "PERSISTING",
	VALIDATING = "VALIDATING",
	VALIDATED = "VALIDATED",
	PAYMENT_REQUESTED = "PAYMENT_REQUESTED",
	PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
	ERROR_PAYMENT_TIMEOUT = "ERROR_PAYMENT_TIMEOUT",
	REFUND_REQUESTED = "REFUND_REQUESTED",
	REFUND_SENT = "REFUND_SENT",
	TRANSFER_REQUESTED = "TRANSFER_REQUESTED",
	RETIRE_REQUESTED = "RETIRE_REQUESTED",
	VCC_VALIDATION = "VCC_VALIDATION",
	CLIENT_CONFIRMATION = "CLIENT_CONFIRMATION",
	WAITING_VCC_TRANSFER = "WAITING_VCC_TRANSFER",
	VCC_TRANSFER_VALIDATION = "VCC_TRANSFER_VALIDATION",
	ERROR_REJECTED = "ERROR_REJECTED",
	ERROR_INVALID_INPUT = "ERROR_INVALID_INPUT",
	ERROR_GENERAL = "ERROR_GENERAL",
	ERROR_VALIDATION = "ERROR_VALIDATION",
	ERROR_ON_BC_SEND = "ERROR_ON_BC_SEND",
	ERROR_IN_ETH_TX = "ERROR_IN_ETH_TX",
	ERROR_BC_CONFIRMED_BUT_FAILED = "ERROR_BC_CONFIRMED_BUT_FAILED",
	ERROR_ON_VCC_SERVICE_INTERACTION = "ERROR_ON_VCC_SERVICE_INTERACTION",
	ERROR_VCC_SOURCE_EXISTS = "ERROR_VCC_SOURCE_EXISTS",
	ERROR_VCC_SOURCE_CONFLICT = "ERROR_VCC_SOURCE_CONFLICT",
	ERROR_PENDING_TIMEOUT = "ERROR_PENDING_TIMEOUT",
	ERROR_TRANSFER_FAILED = "ERROR_TRANSFER_FAILED",
	ERROR_RETIRE_FAILED = "ERROR_RETIRE_FAILED",
	PERFORMED = "PERFORMED"
}
export type OrderRequest = {
	orderId: string;
	btOptionId: string;
	quantity: number;
	signature: string | null;
};
export type OrderRecord = {
	uuid: string;
	status: OrderRecordStatus;
	txHash: string;
	createdAt: string;
	updatedAt: string;
	btOptionId: string;
	quantity: number;
	signature: string;
	premium: number;
	ethAddr: string;
};
export type OrderCreateRequest = {
	orderId: string;
	btOptionId: string;
	quantity: number;
	signature: string;
};
export type OptionsOrderStruct = {
	orderId: string;
	btOptionId: string;
	quantity: string;
};
export enum DeploymentStatus {
	NEW = "NEW",
	DEPLOYMENT_FAILED = "DEPLOYMENT_FAILED",
	DEPLOYED = "DEPLOYED",
	DISABLE = "DISABLED",
	DEPLOY_IN_PROCESS = "DEPLOY_IN_PROCESS",
	WAIT_BC_CONFIRMATION = "WAIT_BC_CONFIRMATION"
}
export type OptionsContractRecord = {
	uuid: string;
	btOptionsVaultId: string;
	expiry: string;
	contractAddress: string | null;
	btContractAddress: string | null;
	expiryPrice: number;
	createdAt: string;
	updatedAt: string;
	deploymentStatus: DeploymentStatus;
};
export enum OptionType {
	Call = "Call",
	Put = "Put"
}
export type OptionsProduct = {
	uuid: string;
	contractId: string;
	strike: number;
	optionType: OptionType;
	enabled: boolean;
	updatedAt: string;
	vaultAddr: string;
	contractAddr: string;
	premiumPrice: number;
	expiry: string;
};
export type Client = {
	uuid: string;
	inviterUuid: string | null;
	invitationCode: string;
	profilePrecalc: string;
	wallets: [
		{
			ethAddr: string;
		}
	];
};
export type OffsetOrderStripe = {
	vccSpecRecord: {
		id: number;
		spec: string;
		specHash: string;
		source: TokenizationSource;
		projectId: string;
		vintage: number;
		description: string;
		imageUrl: string;
		createdAt: string;
	};
	amount: number;
	orderSum: number | null;
	postAction: "TRANSFER" | "RETIRE";
	ethAddr: string;
	status: OrderRecordStatus;
	created: number;
	updatedAt: number;
	transferHash: string;
	retireHash: string;
};

export type OffsetOrderNFT = {
	vccSpecRecord: {
		id: number;
		spec: string;
		specHash: string;
		source: TokenizationSource;
		projectId: string;
		vintage: number;
		description: string;
		imageUrl: string;
		createdAt: string;
	};
	txHash: string;
	dt: number;
	ethAddr: string;
	retiredAmount: number;
	reason: string | null;
	transferee: string | null;
};

export type OffsetOrder = {
	vccSpecRecord: {
		id: number;
		spec: string;
		specHash: string;
		source: TokenizationSource;
		projectId: string;
		vintage: number;
		description: string;
		imageUrl: string;
		createdAt: string;
	};
	txHash: string;
	dt: number;
	ethAddr: string;
	retiredAmount: number;
	orderSum: number | null;
};
export type Swap = {
	amount0: string;
	amount1: string;
	recipient: {
		id: string;
	};
	timestamp: string;
};
export type SwapTransaction = {
	action: "Buy NBT" | "Sell NBT";
	timestamp: string;
	amount: string;
	type: "Income" | "Outcome";
};

export interface AirportDataSet {
	name: string;
	code: string;
	lat: number;
	long: number;
}

export interface HouseholdEmissionFactorDataset {
	people: {
		count: number;
	};
	electricity: {
		kWh: number;
	};
	naturalGas: {
		kWh: number;
		therms: number;
		"USD ($)": number;
	};
	heatingOil: {
		kWh: number;
		litres: number;
		"metric tons": number;
		"US gallons": number;
	};
	coal: {
		kWh: number;
		"metric tons": number;
		"x 10kg bags": number;
		"x 20kg bags": number;
		"x 25kg bags": number;
		"x 50kg bags": number;
	};
	lpg: {
		kWh: number;
		litres: number;
		therms: number;
		"US gallons": number;
	};
	propane: {
		litres: number;
		"US gallons": number;
	};
	woodenPellets: {
		"metric tons": number;
	};
}

export type HouseholdEmissionFactors = {
	[type in keyof HouseholdEmissionFactorDataset]: {
		[unit in keyof HouseholdEmissionFactorDataset[type]]: number;
	};
};

export type HouseDetails = {
	[key in keyof HouseholdEmissionFactorDataset]: {
		amount: number;
		unit: keyof HouseholdEmissionFactorDataset[key] & string;
	};
};

export interface FlightDetails {
	isReturn: boolean;
	from: string;
	to: string;
	travelClass: (typeof classEmissionFactorOptions)[number];
	trips: number;
	includeRad: boolean;
}

export interface CarEfficiency {
	Car: {
		[subType: string]: {
			[model: string]: {
				"average value": number;
			};
		};
	};
	Van: {
		[subType: string]: {
			[model: string]: {
				"average value": number;
			};
		};
	};
}

export interface CarDetails {
	carType: keyof CarEfficiency & string;
	subType: string;
	model: string;
	amount: number;
	isMiles: boolean;
}

export interface MotorbikeDetails {
	type: (typeof bikeTypeOptions)[number];
	amount: number;
	isMiles: boolean;
}

export interface BusEmissionFactors {
	bus: number;
	coach: number;
	localOrCommuterTrain: number;
	longDistanceTrain: number;
	tram: number;
	subway: number;
	taxi: number;
}

export interface BusDetails {
	consumption: BusConsumption;
	isMiles: boolean;
}

export interface BusConsumption {
	bus: number;
	coach: number;
	localOrCommuterTrain: number;
	longDistanceTrain: number;
	tram: number;
	subway: number;
	taxi: number;
}

export interface SecondaryDetails {
	currency: (typeof currencyFactorOptions)[number];
	duration: (typeof durationFactorOptions)[number];
	dietStyle: (typeof dietStyleOptions)[number];
	consumption: SecondaryConsumption;
}

export interface SecondaryConsumption {
	food: number;
	pharma: number;
	clothes: number;
	paperBased: number;
	it: number;
	tv: number;
	motorVehicles: number;
	furniture: number;
	hotels: number;
	phone: number;
	finance: number;
	insurance: number;
	education: number;
	recreational: number;
}

export interface Village {
	id: number;
	name: string;
	population: number;
	description: string;
	image: string;
}

export interface BespokeAddOn {
	title: string;
	description: string;
	image: string;
	disabledOnAdv: boolean;
	options?: Village[];
}

export interface CommunityAddOn {
	villageId: number;
	adoptionYears: number;
}

export interface FamilyMember {
	yearOfBirth: number;
	query: FootprintQuery[];
}

export interface BespokeAddOnDetails {
	villages: CommunityAddOn[];
	familyMembers: FamilyMember[];
}

export interface EnergyConsumptionDetails {
	house?: HouseDetails;
	flights?: FlightDetails[];
	cars?: CarDetails[];
	motorbikes?: MotorbikeDetails[];
	bus?: BusDetails;
	secondary?: SecondaryDetails;
	bespokeAddOns?: Omit<BespokeAddOnDetails, "familyMembers">;
}

export interface AdvancedFootprint {
	advanceFootprint: number;
	summary: {
		house: number;
		flights: number;
		cars: number;
		motorbikes: number;
		bus: number;
		secondary: number;
		bespokeAddOns: {
			villages: Array<Village & { footprint: number }>;
			total: number;
		};
	};
}

export * from "./IRegistryContract";
export * from "./IBaseTokenManagerContract";
export * from "./IERC1155Contract";
export * from "./IERC20Contract";
export * from "./IQuoterContract";
export * from "./ISwapRouterContract";
export * from "./IZeroExContract";
export * from "./ZeroExProtocol";
