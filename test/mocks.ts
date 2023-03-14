import {
	Client,
	ClientProfile,
	DeploymentStatus,
	HttpResponseIn,
	OffsetHistory,
	OffsetStats,
	OptionsContractRecord,
	OptionsProduct,
	OptionType,
	OrderRecord,
	OrderRecordStatus,
	OrderRequest,
	PriceListings,
	SearchOrdersResponsePayload,
	TheaERC1155Balance,
	TokenizationHistory,
	TokenizationSource,
	TokenizationState,
	TokenizationStats,
	TokenizationStatus
} from "../src";

export const PRIVATE_KEY = "5b5354654516fb598d5c51594e0b50c8f1e1fac0b27424b6251b3e6fd96f4207";
export const WALLET_ADDRESS = "0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a";
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const ABI = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [],
		name: "greet",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

export const tokenizationState: TokenizationState = {
	result: {
		uuid: "00000185b7153c46c4dca62b4ebcd490",
		createdAt: "2023-01-15T20:18:20.358Z",
		updatedAt: "2023-01-15T20:18:20.358Z",
		email: "miloscovilons@gmail.com",
		fullName: "Milos Covilo",
		ethAddr: "0xbd44572e53343a0f003b719cf438c6338bd29d9c",
		source: TokenizationSource.VERRA,
		subaccountId: "12274",
		batchId: "11158-289118799-289118805-VCS-VCU-263-VER-KH-14-1748-01012019-31122019-1",
		status: TokenizationStatus.IN_QUEUE,
		specInfo: null,
		statusMess: null,
		transferId: null,
		signProcId: null,
		signDocPdf: null,
		signCertPdf: null
	},
	error: null,
	errorMessage: null
};
export const subgraphResponse = {
	data: {
		tokens: [
			{
				id: "1",
				tokenURI: "1.json",
				projectId: "1748",
				vintage: "2019",
				activeAmount: "100000",
				mintedAmount: "100000",
				retiredAmount: "0",
				unwrappedAmount: "0"
			},
			{
				id: "2",
				tokenURI: "1.json",
				projectId: "1749",
				vintage: "2019",
				activeAmount: "100000",
				mintedAmount: "100000",
				retiredAmount: "0",
				unwrappedAmount: "0"
			},
			{
				id: "3",
				tokenURI: "1.json",
				projectId: "1749",
				vintage: "2019",
				activeAmount: "100000",
				mintedAmount: "100000",
				retiredAmount: "0",
				unwrappedAmount: "0"
			}
		]
	}
};

export const postOrderResponseMock = {
	erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
	erc20TokenAmount: "12000000000000000000",
	nftToken: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
	nftTokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
	nftTokenAmount: "1",
	nftType: "ERC1155",
	sellOrBuyNft: "sell",
	chainId: "80001",
	order: {
		direction: 0,
		erc20Token: "0xd393b1e02da9831ff419e22ea105aae4c47e1253",
		erc20TokenAmount: "12000000000000000000",
		erc1155Token: "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
		erc1155TokenId: "113604032257357238510303590891918450986076622282835488971632849699550347132938",
		erc1155TokenAmount: "1",
		erc1155TokenProperties: [],
		expiry: "2524604400",
		fees: [],
		maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
		nonce: "100133271337000000000000000000000000000206548818982333778442832641797464560524",
		signature: {
			r: "0x396f2d0a0328e9d96e41fe9c58b61d8d19c1051569796135a1d44ab55aa5d57c",
			s: "0x220f98a893146109b2a2a9b4832c9cdf39d9b5e353a274e1829360840080638c",
			v: 27,
			signatureType: 2
		},
		taker: "0x0000000000000000000000000000000000000000"
	},
	orderStatus: { status: null, transactionHash: null, blockNumber: null },
	metadata: {}
};
export const priceListingMock: SearchOrdersResponsePayload = {
	orders: [
		{
			erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
			erc20TokenAmount: "10000000000000000000",
			nftToken: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
			nftTokenId: "69",
			nftTokenAmount: "100",
			nftType: "ERC1155",
			sellOrBuyNft: "buy",
			chainId: "1337",
			order: {
				direction: 1,
				erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
				erc20TokenAmount: "10000000000000000000",
				erc1155Token: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
				erc1155TokenId: "69",
				erc1155TokenAmount: "100",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
				nonce: "100131415900000000000000000000000000000096685863241593142117280893798097702934",
				signature: {
					r: "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
					s: "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
					v: 28,
					signatureType: 2
				},
				taker: "0x0000000000000000000000000000000000000000"
			},
			orderStatus: {
				status: null,
				transactionHash: null,
				blockNumber: null
			},
			metadata: {}
		},
		{
			erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
			erc20TokenAmount: "100000000000000000",
			nftToken: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
			nftTokenId: "69",
			nftTokenAmount: "10",
			nftType: "ERC1155",
			sellOrBuyNft: "buy",
			chainId: "1337",
			order: {
				direction: 1,
				erc20Token: "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
				erc20TokenAmount: "100000000000000000",
				erc1155Token: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
				erc1155TokenId: "69",
				erc1155TokenAmount: "10",
				erc1155TokenProperties: [],
				expiry: "2524604400",
				fees: [],
				maker: "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
				nonce: "100131415900000000000000000000000000000096685863241593142117280893798097702934",
				signature: {
					r: "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
					s: "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
					v: 28,
					signatureType: 2
				},
				taker: "0x0000000000000000000000000000000000000000"
			},
			orderStatus: {
				status: null,
				transactionHash: null,
				blockNumber: null
			},
			metadata: {}
		}
	]
};

export const priceListingReturnMockSell: PriceListings[] = [
	{
		priceForOneNFT: 20,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 0,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "200000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	},
	{
		priceForOneNFT: 10,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 0,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "100000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	}
];

export const priceListingReturnMockBuy: PriceListings[] = [
	{
		priceForOneNFT: 10,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 1,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "100000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	},
	{
		priceForOneNFT: 20,
		nftTokenAmount: "10",
		orderId: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
		orderToBeFilled: {
			direction: 1,
			erc20Token: "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
			erc20TokenAmount: "200000000000000000000",
			erc1155Token: "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
			erc1155TokenId: "1",
			erc1155TokenAmount: "10",
			erc1155TokenProperties: [],
			expiry: "2524604400",
			fees: [],
			maker: "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
			nonce: "100133271337000000000000000000000000000173830542377169720320941218856725572133",
			signature: {
				r: "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
				s: "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
				v: 28,
				signatureType: 2
			},
			taker: "0x0000000000000000000000000000000000000000"
		}
	}
];

export const tokenizationHistory: TokenizationHistory[] = [
	{
		id: "1",
		projectId: "1748",
		vintage: "2019"
	},
	{
		id: "2",
		projectId: "1749",
		vintage: "2020"
	},
	{
		id: "3",
		projectId: "1750",
		vintage: "2021"
	}
];

export const tokenizationStats: TokenizationStats = {
	id: "1",
	projectId: "1748",
	vintage: "2019",
	tokenURI: "1.json",
	activeAmount: "99000",
	mintedAmount: "100000",
	retiredAmount: "1000",
	unwrappedAmount: "0"
};

export const offsetHistory: OffsetHistory[] = [
	{
		id: "1-1360-0",
		amount: "1000",
		timestamp: "1676365774",
		by: {
			id: WALLET_ADDRESS
		}
	},
	{
		id: "1-1361-0",
		amount: "2000",
		timestamp: "1676365999",
		by: {
			id: WALLET_ADDRESS
		}
	}
];

export const offsetStats: OffsetStats = {
	id: "1-1360-0",
	amount: "1000",
	timestamp: "1676365999",
	by: {
		id: WALLET_ADDRESS
	},
	token: {
		id: "1",
		projectId: "1748",
		vintage: "2019",
		tokenURI: "1.json",
		activeAmount: "99000",
		mintedAmount: "100000",
		retiredAmount: "1000",
		unwrappedAmount: "0"
	}
};

export const theaERC1155Balances: TheaERC1155Balance[] = [
	{
		amount: "1000",
		token: {
			id: "1"
		}
	},
	{
		amount: "2000",
		token: {
			id: "2"
		}
	}
];

export const userProfile: HttpResponseIn<ClientProfile> = {
	result: {
		userID: "00000186c48bc47f1778c129a9bdb0a2",
		walletAddress: WALLET_ADDRESS,
		uniqueReferralCode: "ZL6IY2",
		active: true,
		referrerID: null,
		loyalty: {
			badges: [],
			tier: 1
		},
		bridgingBonusPaid: false,
		offsetBonusPaid: false,
		outstandingReferrals: {},
		currentRpBalance: {
			"20230310Z": 0
		},
		historicRpChanges: [],
		historicTierChanges: [],
		historicPositionChanges: null,
		totalRetiredAmount: 0,
		invitations: 0
	},
	error: null,
	errorMessage: null
};
export const deployedOptionsContracts: HttpResponseIn<OptionsContractRecord[]> = {
	result: [
		{
			uuid: "00000186c4c423521c1d41a0d03c501a",
			btOptionsVaultId: "00000186c4c39ce2b441bff1bc43bec3",
			expiry: "2027-12-12T12:00:00.000Z",
			contractAddress: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
			btContractAddress: "0x8583f4f5be04d7d37200c9dc0a5f5ee7ef8fbe34",
			expiryPrice: 0,
			createdAt: "2023-03-09T05:07:13.874Z",
			updatedAt: "2023-03-09T06:22:26.257Z",
			deploymentStatus: DeploymentStatus.DEPLOYED
		},
		{
			uuid: "00000186c4f23e19daf25a6e687f1246",
			btOptionsVaultId: "00000186c4c39ce2b441bff1bc43bec3",
			expiry: "2026-12-12T12:00:00.000Z",
			contractAddress: "0x96bf2642d5ca9b0cbc6f15ad126d7084c09dba83",
			btContractAddress: "0x8583f4f5be04d7d37200c9dc0a5f5ee7ef8fbe34",
			expiryPrice: 0,
			createdAt: "2023-03-09T05:57:35.385Z",
			updatedAt: "2023-03-09T05:58:18.034Z",
			deploymentStatus: DeploymentStatus.DEPLOYED
		}
	],
	error: null,
	errorMessage: null
};

export const optionsProducts: HttpResponseIn<OptionsProduct[]> = {
	result: [
		{
			uuid: "00000186c51111b5a3e818eae0ae9bd1",
			contractId: "00000186c4c423521c1d41a0d03c501a",
			strike: 7,
			optionType: OptionType.Call,
			enabled: true,
			updatedAt: "2023-03-09T06:31:15.637Z",
			vaultAddr: "0x185e0a8e68c58dcb6542b0a2c3d35f193ecc1437",
			contractAddr: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
			premiumPrice: 0.0005566631703711085
		},
		{
			uuid: "00000186c510db6ba6e0a324a79792ab",
			contractId: "00000186c4c423521c1d41a0d03c501a",
			strike: 7,
			optionType: OptionType.Put,
			enabled: true,
			updatedAt: "2023-03-09T06:31:01.739Z",
			vaultAddr: "0x185e0a8e68c58dcb6542b0a2c3d35f193ecc1437",
			contractAddr: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
			premiumPrice: 5.800556663166686
		}
	],
	error: null,
	errorMessage: null
};

export const mockOrders: HttpResponseIn<OrderRecord[]> = {
	result: [
		{
			uuid: "34",
			status: OrderRecordStatus.PERFORMED,
			txHash: "0x1d219f5f4ff80f5c1f052d5d576c80d6c06972e4a435c5b9e8a47a255d006f60",
			createdAt: "2023-03-10T11:09:45.645Z",
			updatedAt: "2023-03-10T11:09:45.645Z",
			btOptionId: "00000186c51111b5a3e818eae0ae9bd1",
			quantity: 1,
			signature:
				"1C.F59AF258606198D5052B6D32A9EC0A94EC1F5B85A0B44CEB3EAA3DDE62A0D9F6.3955531DE209FFB3FE7671FC385669B489EC1E26C7C830885D19BD2222E49414",
			premium: 0.0005566631703711085,
			ethAddr: WALLET_ADDRESS
		}
	],
	error: null,
	errorMessage: null
};

export const mockPrepareOptionsOrder: HttpResponseIn<OrderRequest> = {
	result: {
		orderId: "1",
		btOptionId: "00000186c510db6ba6e0a324a79792ab",
		quantity: 1,
		signature: ""
	},
	error: null,
	errorMessage: null
};

export const mockOptionsOrder: HttpResponseIn<OrderRecord> = {
	result: {
		uuid: "1",
		status: OrderRecordStatus.REQUESTED,
		txHash: "0x1d219f9f4ff80f5c1f052d5d576e80d6c06972e4a435c5b9e8a47a255d006f98",
		createdAt: "2023-03-10T11:41:04.287Z",
		updatedAt: "2023-03-10T11:41:04.287Z",
		btOptionId: "00000186c510db6ba6e0a324a79792ab",
		quantity: 0,
		signature:
			"1C.F59AF258606198D5052B6D32A9EC0A94EC1F5B85A0B44CEB3EAA3DDE62A0D9F6.3955531DE209FFB3FE7671FC385669B489EC1E26C7C830885D19BD2222E49414",
		premium: 0,
		ethAddr: WALLET_ADDRESS
	},
	error: null,
	errorMessage: null
};

export const mockLoginRequest: HttpResponseIn<string> = {
	result: "LOGIN_0x58e89583c13913a928662c1ac81988cac62df80b_1674797584045_-3941831526145628368",
	error: null,
	errorMessage: null
};

export const mockClient: HttpResponseIn<Client> = {
	result: {
		uuid: "00000356c510db6ba6e0a324a79792ds",
		inviterUuid: null,
		invitationCode: "ZL6IY2",
		profilePrecalc: JSON.stringify(userProfile.result),
		wallets: [
			{
				ethAddr: WALLET_ADDRESS
			}
		]
	},
	error: null,
	errorMessage: null
};
