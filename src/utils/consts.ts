import { BigNumber } from "@ethersproject/bignumber";
import { BespokeAddOn, CarEfficiency, HouseholdEmissionFactors, TheaNetwork } from "../types";
import { carEfficiency, householdEmissionFactors, villages } from "./datasets";

export const RATE_VCC_TO_BT = 10;
export const STABLE_TOKEN_DECIMALS_MULTIPLIER = 10 ** 18;
export const ORDERBOOK_URL = "https://api.trader.xyz/orderbook";
export const DEFAULT_SLIPPAGE_TOLERANCE = 0.5;
export const INFINITE_EXPIRATION_TIMESTAMP_SEC = BigNumber.from(2524604400);
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const RESERVED_APP_ID_PREFIX = "1001";

// Some arbitrarily high number.
export const MAX_APPROVAL = BigNumber.from(2).pow(118);
// Number of digits in base 10 128bit nonce
// floor(log_10(2^128 - 1)) + 1
export const ONE_TWENTY_EIGHT_BIT_LENGTH = 39;
// Max nonce digit length in base 10
// floor(log_10(2^256 - 1)) + 1
export const TWO_FIFTY_SIX_BIT_LENGTH = 78;

export const ERC1155ORDER_STRUCT_NAME = "ERC1155Order";
export const ERC1155ORDER_STRUCT_ABI = [
	{ type: "uint8", name: "direction" },
	{ type: "address", name: "maker" },
	{ type: "address", name: "taker" },
	{ type: "uint256", name: "expiry" },
	{ type: "uint256", name: "nonce" },
	{ type: "address", name: "erc20Token" },
	{ type: "uint256", name: "erc20TokenAmount" },
	{ type: "Fee[]", name: "fees" },
	{ type: "address", name: "erc1155Token" },
	{ type: "uint256", name: "erc1155TokenId" },
	{ type: "Property[]", name: "erc1155TokenProperties" },
	{ type: "uint128", name: "erc1155TokenAmount" }
];

export const DEFAULT_APP_ID = "33271337";
export const FEE_ABI = [
	{ type: "address", name: "recipient" },
	{ type: "uint256", name: "amount" },
	{ type: "bytes", name: "feeData" }
];

export const PROPERTY_ABI = [
	{ type: "address", name: "propertyValidator" },
	{ type: "bytes", name: "propertyData" }
];
export enum Events {
	unwrap = "UnwrapRequested",
	convert = "Converted",
	recover = "Recovered",
	rollTokens = "Rolled",
	retireOffset = "RetireFungibleRequested"
}

export type EnvConfig = {
	networkName: string;
	registryContract: string;
	theaERC1155Contract: string;
	vintageTokenContract: string;
	sdgTokenContract: string;
	ratingTokenContract: string;
	currentNbtTokenContract: string;
	baseTokenManagerContract: string;
	baseTokenManagerDeployerContract: string;
	stableTokenContract: string;
	quoterContract: string;
	swapRouterContract: string;
	theaApiBaseUrl: string;
	exchangeProxyAddress: string;
	subGraphUrl: string;
};

export const consts: { [key in TheaNetwork]: EnvConfig } = {
	[TheaNetwork.GANACHE]: {
		networkName: "GANACHE",
		registryContract: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20",
		theaERC1155Contract: "0xe135783649BfA7c9c4c6F8E528C7f56166efC8a6",
		vintageTokenContract: "0x686AfD6e502A81D2e77f2e038A23C0dEf4949A20",
		sdgTokenContract: "0x43D1F9096674B5722D359B6402381816d5B22F28",
		ratingTokenContract: "0x4261D524bc701dA4AC49339e5F8b299977045eA5",
		currentNbtTokenContract: "", // Call setCurrentNBTContractAddress to set address at init/thea.ts
		baseTokenManagerContract: "0x95C8f889701f20b624875a5188bEbDc9289b4F51",
		baseTokenManagerDeployerContract: "0x63491c5363329afb6f370E9D297025481E0277e6",
		stableTokenContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", //DAI
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		swapRouterContract: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
		theaApiBaseUrl: "https://127.0.0.1:8078/cli",
		exchangeProxyAddress: "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
		subGraphUrl: "http://localhost:8000/subgraphs/name/thea-protocol/thea-subgraph"
	},
	[TheaNetwork.MUMBAI]: {
		networkName: "MUMBAI",
		registryContract: "0xdd4209d1dba29e49a9113fed15e1f0dda6264d72",
		theaERC1155Contract: "0x151e13c5b354bee579976dc296c88bb817c77d18",
		vintageTokenContract: "0x1eAad7EA381e4035956120f093639E51dDbbC01f",
		sdgTokenContract: "0x3E076c36B3520aEFC3A475d9232D0E320d15c0Df",
		ratingTokenContract: "0xdf9dfBD50C104c980CaD3119dA86391558379f1E",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "0x0aA2d82e03Bc4fd092ba0dd105119Ec46aED2f76",
		baseTokenManagerDeployerContract: "0xd741ea92ada5cc18bfde2c27ad64dc48860a4f15",
		stableTokenContract: "0x1D6DBfb520ee332bc14e800A832389F731820787",
		quoterContract: "0x0212e50da5443A87aE156F6C4002E38333139A13",
		swapRouterContract: "0x0212e50da5443A87aE156F6C4002E38333139A13",
		theaApiBaseUrl: "https://client.dev.thea.earth/cli",
		exchangeProxyAddress: "0x4fb72262344034e034fce3d9c701fd9213a55260",
		subGraphUrl: "https://api.studio.thegraph.com/query/43315/thea-subgraph/v0.1.4"
	},
	[TheaNetwork.POLYGON]: {
		networkName: "POLYGON",
		registryContract: "0x88449Dd0a1b75BC607A1E971b13930617D535EC1",
		theaERC1155Contract: "0x22d5f9B75c524Fec1D6619787e582644CD4D7422", // sunflower
		vintageTokenContract: "0x3621027715647B69D706636a8878E85d725A2aed",
		sdgTokenContract: "0xB48C895039c9F81C87eb97Ed54B69a769b291f28",
		ratingTokenContract: "0xc95347BD5212148A09c34a7d890D061D73f50bb8",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76",
		baseTokenManagerDeployerContract: "0x3ace09bba3b8507681146252d3dd33cd4e2d4f63",
		stableTokenContract: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
		quoterContract: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
		swapRouterContract: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
		theaApiBaseUrl: "https://127.0.0.1:8078/cli",
		exchangeProxyAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
		subGraphUrl: "http://localhost:8000/subgraphs/name/thea-protocol/thea-subgraph"
	},
	[TheaNetwork.HAQQ_TESTNET]: {
		networkName: "HAQQ_TESTNET",
		registryContract: "0xacb833df5b99f967696ca7535ee1b3b058d5cd91",
		theaERC1155Contract: "0xb903112a6872106f1da9823f29958da7fd77036c",
		vintageTokenContract: "",
		sdgTokenContract: "",
		ratingTokenContract: "",
		currentNbtTokenContract: "",
		baseTokenManagerContract: "",
		baseTokenManagerDeployerContract: "0x79327523b9bb56d1db76b3b4b2e842c4a44b4c08",
		stableTokenContract: "",
		quoterContract: "",
		swapRouterContract: "",
		theaApiBaseUrl: "https://127.0.0.1:8078/cli",
		exchangeProxyAddress: "0x559098ade32e3ce504d7a53643c5e3d644d0b680",
		subGraphUrl: "http://localhost:8000/subgraphs/name/thea-protocol/thea-subgraph"
	}
};

export type ISO_CODES =
	| "AFG"
	| "ALA"
	| "ALB"
	| "DZA"
	| "ASM"
	| "AND"
	| "AGO"
	| "AIA"
	| "ATA"
	| "ATG"
	| "ARG"
	| "ARM"
	| "ABW"
	| "AUS"
	| "AUT"
	| "AZE"
	| "BHS"
	| "BHR"
	| "BGD"
	| "BRB"
	| "BLR"
	| "BEL"
	| "BLZ"
	| "BEN"
	| "BMU"
	| "BTN"
	| "BOL"
	| "BES"
	| "BIH"
	| "BWA"
	| "BRA"
	| "VGB"
	| "BRN"
	| "BGR"
	| "BFA"
	| "BDI"
	| "KHM"
	| "CMR"
	| "CAN"
	| "CPV"
	| "CAF"
	| "TCD"
	| "CHL"
	| "CHN"
	| "CXR"
	| "COL"
	| "COM"
	| "COG"
	| "COK"
	| "CRI"
	| "CIV"
	| "HRV"
	| "CUB"
	| "CUW"
	| "CYP"
	| "CZE"
	| "COD"
	| "DNK"
	| "DJI"
	| "DMA"
	| "DOM"
	| "ECU"
	| "EGY"
	| "SLV"
	| "GNQ"
	| "ERI"
	| "EST"
	| "SWZ"
	| "ETH"
	| "FRO"
	| "FLK"
	| "FJI"
	| "FIN"
	| "FRA"
	| "GUF"
	| "PYF"
	| "GAB"
	| "GMB"
	| "GEO"
	| "DEU"
	| "GHA"
	| "GRC"
	| "GRL"
	| "GRD"
	| "GLP"
	| "GTM"
	| "GGY"
	| "GIN"
	| "GNB"
	| "GUY"
	| "HTI"
	| "HND"
	| "HKG"
	| "HUN"
	| "ISL"
	| "IND"
	| "IDN"
	| "IRN"
	| "IRQ"
	| "IRL"
	| "IMN"
	| "ISR"
	| "ITA"
	| "JAM"
	| "JPN"
	| "JEY"
	| "JOR"
	| "KAZ"
	| "KEN"
	| "KIR"
	| "KWT"
	| "KGZ"
	| "LAO"
	| "LVA"
	| "LBN"
	| "LSO"
	| "LBR"
	| "LBY"
	| "LIE"
	| "LTU"
	| "LUX"
	| "MAC"
	| "MDG"
	| "MWI"
	| "MYS"
	| "MDV"
	| "MLI"
	| "MLT"
	| "MHL"
	| "MTQ"
	| "MRT"
	| "MUS"
	| "MYT"
	| "MEX"
	| "FSM"
	| "MDA"
	| "MNG"
	| "MNE"
	| "MSR"
	| "MAR"
	| "MOZ"
	| "MMR"
	| "NAM"
	| "NRU"
	| "NPL"
	| "NLD"
	| "ANT"
	| "NCL"
	| "NZL"
	| "NIC"
	| "NER"
	| "NGA"
	| "NIU"
	| "PRK"
	| "MKD"
	| "NOR"
	| "OMN"
	| "PAK"
	| "PLW"
	| "PSE"
	| "PAN"
	| "PNG"
	| "PRY"
	| "PER"
	| "PHL"
	| "POL"
	| "PRT"
	| "PRI"
	| "QAT"
	| "REU"
	| "ROU"
	| "RUS"
	| "RWA"
	| "SHN"
	| "KNA"
	| "LCA"
	| "MAF"
	| "SPM"
	| "VCT"
	| "WSM"
	| "STP"
	| "SAU"
	| "SEN"
	| "SRB"
	| "SYC"
	| "SLE"
	| "SGP"
	| "SXM"
	| "SVK"
	| "SVN"
	| "SLB"
	| "SOM"
	| "ZAF"
	| "KOR"
	| "SSD"
	| "ESP"
	| "LKA"
	| "SDN"
	| "SUR"
	| "SJM"
	| "SWE"
	| "CHE"
	| "SYR"
	| "TWN"
	| "TJK"
	| "TZA"
	| "THA"
	| "TLS"
	| "TGO"
	| "TON"
	| "TTO"
	| "TUN"
	| "TUR"
	| "TKM"
	| "TCA"
	| "TUV"
	| "UGA"
	| "UKR"
	| "ARE"
	| "GBR"
	| "USA"
	| "VIR"
	| "URY"
	| "UZB"
	| "VUT"
	| "VEN"
	| "VNM"
	| "WLF"
	| "ESH"
	| "YEM"
	| "ZMB"
	| "ZWE";

export const classEmissionFactorOptions = [
	"Economy class",
	"Premium economy",
	"Business class",
	"First class",
	"Average (unknown class)"
] as const;

export const bikeTypeOptions = ["<= 125cc", "> 125cc and <= 500cc", "> 500cc"] as const;

export const emissionFactorOptions = ["g/km", "L/100km", "mpg(UK)", "mpg(US)"] as const;

export const durationFactorOptions = ["per year", "per month", "per week"] as const;

export const currencyFactorOptions = ["GBP", "EUR", "USD", "CAD", "AUD", "NZD", "ZAR", "CNY", "HKD", "INR"] as const;

export const dietStyleOptions = [
	"Heavy meat eater",
	"Medium meat eater",
	"Low meat eater",
	"Pescatarian",
	"Vegetarian",
	"Vegan"
] as const;

export const bespokeAddOns: BespokeAddOn[] = [
	{
		title: "Offset Estimated Forward Carbon Footprint of an energy-poor Community",
		description:
			"Offset Estimated Forward Carbon Footprint of an energy-poor Community. For the foreseeable future, fossil fuels may still constitute the pathway for energy poor communities to graduate towards a more prosperous future. Enable a community of your choice to embark on a brighter future.",
		image: "",
		disabledOnAdv: false,
		options: villages
	},
	{
		title: "Offset Basic Carbon Footprint of Family & Friends",
		description:
			"Climate Positive Action, made easy for your family & friends. Offset the estimated average lifetime Carbon Footprint of important people in your life.",
		image: "",
		disabledOnAdv: true
	}
];

export const householdEmissionFactorOptions: {
	[category in keyof HouseholdEmissionFactors]: string[];
} = Object.entries(householdEmissionFactors).reduce(
	(acc, [category, factors]) => ({ ...acc, [category]: Object.keys(factors) }),
	{} as { [category in keyof HouseholdEmissionFactors]: string[] }
);

export const carEfficiencyOptions: {
	[type in keyof CarEfficiency]: {
		[subType in keyof CarEfficiency[type]]: string[];
	};
} = Object.entries(carEfficiency).reduce(
	(acc, [category, categoryValues]) => ({
		...acc,
		[category]: Object.entries(
			categoryValues as {
				[subType: string]: {
					[model: string]: {
						"average value": number;
					};
				};
			}
		).reduce((subAcc, [car, carValues]) => ({ ...subAcc, [car]: Object.keys(carValues) }), {})
	}),
	{} as {
		[type in keyof CarEfficiency]: {
			[subType in keyof CarEfficiency[type]]: string[];
		};
	}
);
