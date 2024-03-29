# Thea SDK [![npm version](https://badge.fury.io/js/@thea-protocol%2Fsdk.svg)](https://badge.fury.io/js/@thea-protocol%2Fsdk)

This is official JS SDK for Thea Protocol

## SDK Initialization

Depending on the platform you're using, there are different ways to initialize the SDK. Below are few samples

```js
// Client side
const theaSDK = await TheaSDK.init({
 network: TheaNetwork.MUMBAI,
 web3Provider: new ethers.providers.Web3Provider(window.ethereum)
});

// Server side with private key and provider
const theaSDK = await TheaSDK.init({
 network: TheaNetwork.MUMBAI,
 privateKey: "123...",
 provider: new ethers.providers.AlchemyProvider(80001, "apiKey")
});

// Server side with signer
const theaSDK = await TheaSDK.init({
 network: TheaNetwork.MUMBAI,
 signer: new Wallet(privateKey, provider)
});
```

You can also pass in a current NBT address as an optional parameter to the SDK initialization. If you don't pass in a current NBT address, the SDK will fetch current base token addres from BaseTokenManager SC. Here is an example of passing in a current NBT address as a parameter:

```js
// Server side init with signer and current NBT address
const theaSDK = await TheaSDK.init({
 network: TheaNetwork.MUMBAI,
 signer: new Wallet(privateKey, provider),
 currentNBTokenAddress: "0x123..."
});
```

- **Note!** You can set new `CurrentNBT` token address anytime by calling:

```js
theaSDK.setCurrentNBTContractAddress("0x123...");
```

## Convert module

- Convert NFTs - Converts `tokenAmount` of Carbon Credit ERC1155 with specific `tokenId` into corresponding amounts of current base token, SDG, Rating and Vintage ERC20's. BaseTokenManager contract gets ownership(locks) ERC1155's and mint's new ERC20 tokens to users address.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.convert.convertNFT(tokenId, tokenAmount);

// Sample output
{
    "id": "1", // token ID
    "amount": '10', // Converted Amount of ERC1155 Tokens
    "to": '0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76',
    "from": '0xbd44572e53343A0f003b719cf438C6338bD29d9C',
    ...
}
```

## Recover module

- Recover NFTs - Recovers `tokenAmount` of Carbon Credit ERC1155 with specific `tokenId` from corresponding amounts of current base token, SDG, Rating and Vintage ERC20's. BaseTokenManager contract sends to user ERC1155's and burns's ERC20 tokens in appropriate amonts.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.recover.recoverNFT(tokenId, tokenAmount);

// Sample output
{
    "id": "1", // token ID
    "amount": '10', // Recovered Amount of ERC1155 Tokens
    "to": '0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76',
    "from": '0xbd44572e53343A0f003b719cf438C6338bD29d9C',
    ...
}
```

- Query recover fungible - Returns list of token amounts needed to recover amount of specified NFT (by tokenID).

```js
// call to unwrap method of Registry contract
const result = await theaSDK.recover.queryRecoverFungibles(tokenId, tokenAmount);

// Sample output
{
    "cbt": "100000000", // current base token amount
    "sdg": '100000000', // sdg tokent amount
    "vintage": '100000000', // vintage token amount
    "rating": '100000000' // rating token amount
}
```

## Roll Tokens module

- Roll base tokens - Rolls `tokenAmount` of Base Token based on their `vintage`. This means that old Base Tokens (defined by sent `vintage`) and vintage tokens are burned and the same amount(`tokenAmount`) of new Base Tokens (defined by `vintage + 1`) is beeing minted. These Base Tokens addresses are defined in BaseTokenManager contract under `baseTokens` mapping with `vintage` as key.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.rollBaseTokens.rollTokens(vintage, tokenAmount);

// Sample output
{
    "user": "0xbd44572e53343A0f003b719cf438C6338bD29d9C", // Address of user who rolled tokens
    "vintage": "2022", // Vintage of old Base Token
    "amount": '10', // Amount of base tokens rolled
    "to": '0xE100c4ffFF7c00253BA4A2a695F5ac909d756D76',
    "from": '0xbd44572e53343A0f003b719cf438C6338bD29d9C',
    ...
}
```

## Unwrap module

- Unwrap token - Stores a request to untokenize the VCC token of type `id`, locks the tokens and emits event. Backend listens to event and process the request. Tokens are not burnt until backend calls `updateUnwrapRequest` function after processing and validating the transfer to offchain `offchainAccount` was succesful.

```js
// call to unwrap method of Registry contract
const result = await theaSDK.unwrap.unwrapToken(tokenId, amount, offchainAccount)

// Sample output
{
    "requestId": "2", // Request ID that we can use to fetch token state
    "to": "0xe135783649BfA7c9c4c6F8E528C7f56166efC8a6", // The rest of the output is ethers Transaction receipt
    "from": "0xbd44572e53343A0f003b719cf438C6338bD29d9C",
    ...
}
```

- Get unwrap token state - Returns the state of the unwrap token request.

```js
// call to requests mapping of Registry contract
const state = await theaSDK.unwrap.getUnwrapTokenState(tokenId)

// Sample output
{
    "status": 0,
    "maker": "0x123...",
    "tokenId": "1",
    "amount": "1000"
}
```

## Tokenization module

- Request tokenization

```js
const tokenizationState = await theaSDK.tokenization.requestTokenization(
    TokenizationSource.VERRA,
    accountId,
    batchId,
    {
      email: "john@test.com",
      ethAddr: "0x123...",
      fullName: "John",
    }
  )
// Sample output
{
    "result": {
        "uuid": "0000018631954fb292bd329c70fe6751", // tokenization ID
        "createdAt": "2023-02-08T15:11:54.291Z",
        "updatedAt": "2023-02-08T15:11:54.291Z",
        "email": "john@test.com",
        "fullName": "John",
        "ethAddr": "0x123...",
        "source": "verra",
        "subaccountId": "43163",
        "batchId": "11158-2891187991...",
        "status": "IN_QUEUE",
        ...
    },
    "error": null,
    "errorMessage": null
}
```

- Get tokenization state - Query tokenization state by tokenization ID

```js
const tokenizationState = await theaSDK.tokenization.getTokenizationState(tokenizationId);
```

- Tokenize - Used to claim tokens after tokenization request is performed and admin approves it

```js
const tokenizationState = await theaSDK.tokenization.tokenize(tokenizationId);
```

## Offset module

- Offset NFT - offsets specified amount of ERC1155 token
  Input parameters

1. tokenId - VCC token id
2. amount - amount of VCC tokens to offset
3. partnerId - UID assigned to partner, should be 0 if offseting directly (optional)
4. receiver - address for whom VCC will be offseted (optional)

```js
const transactionReceipt = await theaSDK.offset.offsetNFT(1, "2000");
```

- Offset fungible - offsets specified amount of ERC20 token for specified vintage
  Input parameters

1. vintage - vintage of NBT token
2. amount - amount of NBT token to retire
3. partnerId - UID assigned to partner, should be 0 if offseting directly (optional)
4. tokenId - ID of VCC token to offset, should be 0 if no preference (optional)

```js
// Returns requestId in transaction receipt
const transactionReceipt = await theaSDK.offset.offsetFungible(2017, "2000");
```

- Get next offset event date - returns the next offset event date

```js
const result = await theaSDK.offset.getNextOffsetEventDate();

// Sample output
{
    "result": "2023-04-05T12:00:00Z";
    "error": null;
    "errorMessage": null;
}
```

- Get offset order history - returns both commited and retired orders

```js
const result = await theaSDK.offset.offsetHistory();

// Sample output
{
  "commited": [],
  "retired": [
    {
      "dt": 1679668669344,
      "ethAddr": "0x7a1dbec6f1203f89942766314be0f36fd4615704",
      "orderSum": null,
      "retiredAmount": 1.2,
      "txHash": "0xabb0f0c45b571585a16956681a88c61a9a1a9d8097a419f467cc3fd5605de3a2",
      "vccSpecRecord": {
        "createdAt": "2023-03-16T12:35:06.747Z",
        "description": "...desc",
        "id": 1,
        "imageUrl": "ipfs://QmQmtWGefBfy2azmvpvciy12R78Y5DQLT4hX26oSWJ4Sfe",
        "projectId": "1748",
        "source": "verra",
        "spec": "...spec",
        "specHash": "5efb1efd47caed4558eb870b6f5fe5c3a4bea16b53ee4437854f580e2ac7b60e",
        "vintage": 2019
      }
    }
  ]
}
```

## Fungible trading

- Query token price - Used to fetch current price by calling Uniswap's V3 Quoter contract

```js
// Token in is "SDG" | "Vintage" | "Rating" | "CurrentNBT" | "Stable"

// From ERC20 to Stable coin
const priceInWEI = await theaSDK.fungibleTrading.queryTokenPrice({
 tokenIn: "SDG"
});

// From Stable coin to ERC20
const priceInWEI = await theaSDK.fungibleTrading.queryTokenPrice({
 tokenIn: "Stable",
 tokenOut: "SDG"
});
```

- Query transaction history - Used to fetch all buy and sell transactions of current NBT token

```js
const txHistory = await theaSDK.fungibleTrading.transactionHistory("0x123...");
// Sample output
[
 {
  action: "Buy NBT",
  timestamp: "1679995741",
  amount: "1",
  type: "Income"
 },
 {
  action: "Sell NBT",
  timestamp: "1679761665",
  amount: "-0.994",
  type: "Outcome"
 },
 {
  action: "Sell NBT",
  timestamp: "1679994793",
  amount: "-0.994",
  type: "Outcome"
 }
];
```

- Swap tokens - Used to swap tokens by calling Uniswap's V3 SwapRouter contract

```js
// From ERC20 to Stable coin
const transactionReceipt = await theaSDK.fungibleTrading.swapTokens({
 tokenIn: "SDG",
 amountIn: "1000000000000000000"
});

// From Stable coin to ERC20
const transactionReceipt = await theaSDK.fungibleTrading.swapTokens({
 tokenIn: "Stable",
 tokenOut: "SDG",
 amountIn: "1000000000000000000"
});
```

## NFT orderbook

- Query token list - Returns a list of ERC1155 tokens that are available, and they are grouped by projectIDs and vintages

```js
const priceInWEI = await theaSDK.nftTokenList.getTokenList();

// Sample output
// (Object which keys are projectIDs and values are arrays of tokens that belong to that project)
{
    "1784": // proojectId
    [       // list of tokens in that project
        {
            "vintage": 2018,
            "tokenID": "1",
            ...
        }
    ]
}
```

- Query Orders Info - Returns a list of orders for a given tokenID and owner

```js
const transactionReceipt = await theaSDK.nftOrderbook.queryOrdersInfo(tokenId, owner);

// Sample output
{
    "orders": [
        {
            "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
            "erc20TokenAmount": "10000000000000000000",
            "nftToken": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
            "nftTokenId": "69",
            "nftTokenAmount": "100",
            "nftType": "ERC1155",
            "sellOrBuyNft": "buy",
            "chainId": "1337",
            "order": {
                "direction": 1,
                "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
                "erc20TokenAmount": "10000000000000000000",
                "erc1155Token": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
                "erc1155TokenId": "69",
                "erc1155TokenAmount": "100",
                "erc1155TokenProperties": [],
                "expiry": "2524604400",
                "fees": [],
                "maker": "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
                "nonce": "100131415900000000000000000000000000000096685863241593142117280893798097702934",
                "signature": {
                    "r": "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
                    "s": "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
                    "v": 28,
                    "signatureType": 2
                },
                "taker": "0x0000000000000000000000000000000000000000"
            },
            "orderStatus": {
                "status": null, // null status indicates that order is not yet executed and is awailable for matching
                "transactionHash": null,
                "blockNumber": null
            },
            "metadata": {}
        },
        ...
    ]
}

```

- Query Price Listings - Returns sorted price listing for a given tokenID and side (buy or sell)

```js
const transactionReceipt = await theaSDK.nftOrderbook.queryPriceListing(tokenId, side);

// Sample output
[
 {
  "priceForOneNFT": 10,
  "nftTokenAmount": "10",
  "orderId": "100133271337000000000000000000000000000173830542377169720320941218856725572133",
  "orderToBeFilled": {
   "direction": 1,
   "erc20Token": "0xa6cbe96c05e92a01b52f519d50541409d85ed6d6",
   "erc20TokenAmount": "100000000000000000000",
   "erc1155Token": "0xf37221f42678ace417f2bc5c89489d1f0c77c133",
   "erc1155TokenId": "1",
   "erc1155TokenAmount": "10",
   "erc1155TokenProperties": [],
   "expiry": "2524604400",
   "fees": [],
   "maker": "0xca1edbea332fe36a4164bfc85bc58de12f07f941",
   "nonce": "100133271337000000000000000000000000000173830542377169720320941218856725572133",
   "signature": {
    "r": "0x004c3187cd41552901eeda3b6aa8bf1934db4cbff9e080d193b30714a62f9ead",
    "s": "0x293711b92b8dd052bdaebd00b84f2997e67b0b6ba8cd699ad513173f2856c867",
    "v": 28,
    "signatureType": 2
   },
   "taker": "0x0000000000000000000000000000000000000000"
  }
 },
    ...
]

```

- Query Order By Nonce - Returns order for a given nonce (orderId)

```js
const transactionReceipt = await theaSDK.nftOrderbook.queryOrderByNonce(nonce);

// Sample output
{
    "orders": [
        {
            "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
            "erc20TokenAmount": "10000000000000000000",
            "nftToken": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
            "nftTokenId": "69",
            "nftTokenAmount": "100",
            "nftType": "ERC1155",
            "sellOrBuyNft": "buy",
            "chainId": "1337",
            "order": {
                "direction": 1,
                "erc20Token": "0x5d29011d843b0b1760c43e10d66f302174bccd1a",
                "erc20TokenAmount": "10000000000000000000",
                "erc1155Token": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
                "erc1155TokenId": "69",
                "erc1155TokenAmount": "100",
                "erc1155TokenProperties": [],
                "expiry": "2524604400",
                "fees": [],
                "maker": "0x9342a65736a2e9c6a84a2adaba55ad1dc1f3a418",
                "nonce": "100131415900000000000000000000000000000096685863241593142117280893798097702934",
                "signature": {
                    "r": "0x39728a3bef397db69c6c6e1409ae6756c567a989894ad0787f9561113c9a80e9",
                    "s": "0x5f8a25be83efa2326e6405c68e8bdf5c0e83894dbef7e31de39d8c073302a1f6",
                    "v": 28,
                    "signatureType": 2
                },
                "taker": "0x0000000000000000000000000000000000000000"
            },
            "orderStatus": {
                "status": null, // null status indicates that order is not yet executed and is awailable for matching
                "transactionHash": null,
                "blockNumber": null
            },
            "metadata": {}
        }
    ]
}
```

## NFT trading

- Enter Limit Order - Creates and submits an off-chain limit order (for specific `tokenId`, `side`, `price` and `quantity`) to the orderbook

```js
const priceInWEI = await theaSDK.nftTrading.enterNFTLimit(
  tokenId, // token id of the NFT
  side, // buy or sell
  price, // price of the NFT in Stablecoins
  quantity, // quantity of the NFT
  chunks? // number of chunks to split the order into (default 1), each chunk will be made into a separate limit order
 );

// Sample output
{
    "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
    "erc20TokenAmount": "100000000000000",
    "nftToken": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
    "nftTokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
    "nftTokenAmount": "1",
    "nftType": "ERC1155",
    "sellOrBuyNft": "buy",
    "chainId": "80001",
    "order": {
        "direction": 1,
        "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
        "erc20TokenAmount": "100000000000000",
        "erc1155Token": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
        "erc1155TokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
        "erc1155TokenAmount": "1",
        "erc1155TokenProperties": [],
        "expiry": "2524604400",
        "fees": [],
        "maker": "0x1e45d9f1be883653ebd1c3311866ec8fab9ba74a",
        "nonce": "100133271337000000000000000000000000000272122256199440695915800875629318974968",
        "signature": {
            "r": "0x103be09b2a88d1c2916a0f85c177cc9f84af3373efd7442d770416a38003ba7b",
            "s": "0x22ac77d199c445c5cf093ef1b6aace677efef0256f6b0d88cbfa4ae0d02b17a3",
            "v": 27,
            "signatureType": 2
        },
        "taker": "0x0000000000000000000000000000000000000000"
    },
    "orderStatus": {
        "status": null, // null status indicates that order is not yet executed and is awailable for matching
        "transactionHash": null,
        "blockNumber": null
    },
    "metadata": {}
}
```

- Cancel Order - Cancels order for specific orderId(`nonce`) on 0x Exchange Conctract and returns transaction receipt

```js
const transactionReceipt = await theaSDK.nftTrading.cancelOrder(orderId);
```

- Update Order - Updates specific order with new `price` and `quantity`. Which includes cancels order for specific orderId(`nonce`) on 0x Exchange Conctract, then creating and submiting new off-chain limit order (for specific `tokenId` and `side` (defined in previously cancelled order), `price` and `quantity` (function input parameters)) to the orderbook

```js
const transactionReceipt = await theaSDK.nftTrading.updateOrder(orderId, price, quantity);

// Sample output
{
    "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
    "erc20TokenAmount": "100000000000000",
    "nftToken": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
    "nftTokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
    "nftTokenAmount": "1",
    "nftType": "ERC1155",
    "sellOrBuyNft": "buy",
    "chainId": "80001",
    "order": {
        "direction": 1,
        "erc20Token": "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
        "erc20TokenAmount": "100000000000000",
        "erc1155Token": "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
        "erc1155TokenId": "113604032257357238510303590891918450986076622282835488971632849699550347132938",
        "erc1155TokenAmount": "1",
        "erc1155TokenProperties": [],
        "expiry": "2524604400",
        "fees": [],
        "maker": "0x1e45d9f1be883653ebd1c3311866ec8fab9ba74a",
        "nonce": "100133271337000000000000000000000000000272122256199440695915800875629318974968",
        "signature": {
            "r": "0x103be09b2a88d1c2916a0f85c177cc9f84af3373efd7442d770416a38003ba7b",
            "s": "0x22ac77d199c445c5cf093ef1b6aace677efef0256f6b0d88cbfa4ae0d02b17a3",
            "v": 27,
            "signatureType": 2
        },
        "taker": "0x0000000000000000000000000000000000000000"
    },
    "orderStatus": {
        "status": null, // null status indicates that order is not yet executed and is awailable for matching
        "transactionHash": null,
        "blockNumber": null
    },
    "metadata": {}
}
```

- Enter NFT Order at Market Price - Creates market order that is filling orders from orderbook (sorted by best prices) to `quantity` specified in method and returns transaction receipt for buy orders (batch buy of ERC1155), or receipt's for sell orders (they are not filled in batch, cause currently there is no such function on 0x Exchange Contract, instead they are filled one by one)

```js
const transactionReceipt = await theaSDK.nftTrading.enterNFTOrderAtMarket(tokenId, side, quantity);
```

- Fill order - Fills a specific `order` (that can be found by calling `queryPriceListings` and using `orderToBeFilled` parameter of desired order) to `amount` specified in a call. Returns transaction receipt

```js
const transactionReceipt = await theaSDK.nftOrderbook.fillOrder(order, amount);
```

## Carbon informations

- Estimate footprint - estimates footprint and returns summary and details about co2 emission for each year per country
  year of birth and country are required to estimate footprint. Optionally details about family members and village adoption can also be provided

```js
const footprint = theaSDK.carbonInfo.estimateFootprint(1996, [
    {
      isoCode: "USA",
      year: 2003,
    },
    {
      isoCode: "FRA",
      year: 2008,
    },
    {
      isoCode: "GBR",
      year: null,
    },
  ],
  {
    familyMembers: [
      {
        yearOfBirth: 2008,
        query: [
          {
            isoCode: "USA",
            year: null,
          },
        ]
      }
    ],
    villages: [
      {
        villageId: 1,
        adoptionYears: 2
      }
    ]
  }
  );

// Sample output
{
    "footprint": 300.6559133529663,
    "summary": [
        {
            "country": "United States",
            "isoCode": "USA",
            "from": 1996,
            "to": 2003,
            "co2Emission": 166.7100372314453
        },
        {
            "country": "France",
            "isoCode": "FRA",
            "from": 2003,
            "to": 2008,
            "co2Emission": 40.139599323272705
        },
        {
            "country": "United Kingdom",
            "isoCode": "GBR",
            "from": 2008,
            "to": 2021,
            "co2Emission": 93.80627679824829
        }
    ],
    "details": [
        {
            "year": 1996,
            "co2Emission": 20.880138397216797,
            "country": "United States",
            "isoCode": "USA"
        },
        {
            "year": 1997,
            "co2Emission": 20.89559555053711,
            "country": "United States",
            "isoCode": "USA"
        }
        ...
    ],
    "bespokeAddOns": {
      "familyMembers": [10.43543],
      "villages": [
        {
          "id": 1,
          "name": "Sto. Bosa (La Trinidad)",
          "population": 137404,
          "description":
            "Offset estimated forward carbon footprint of an energy poor community. Enable a typical village in the Philippines to embark on a brighter future.",
          "image": urlToImage,
          "footprint": 45643.4543
        }
      ],
      "total": 45653.88973
    }
}

// Get list of all country codes
const countries = theaSDK.carbonInfo.countries()
```

- Estimate Advance footprint - gives a granular estimate of Carbon Footprint based on historical lifestyle choices using a variety of data inputs, such as energy usage, transportation choices, food consumption, and waste management practices.

```js
const footprint = theaSDK.carbonInfo.estimateAdvancedFootprint(
  {
    "house": {
        "people": {
            "amount": 10,
            "unit": "count"
        },
        "coal": {
            "amount": 450,
            "unit": "kWh"
        },
        "electricity": {
            "amount": 5460,
            "unit": "kWh"
        },
        "heatingOil": {
            "amount": 5637,
            "unit": "kWh"
        },
        "lpg": {
            "amount": 4560,
            "unit": "kWh"
        },
        "naturalGas": {
            "amount": 4560,
            "unit": "kWh"
        },
        "propane": {
            "amount": 450,
            "unit": "litres"
        },
        "woodenPellets": {
            "amount": 8757,
            "unit": "metric tons"
        }
    },
    "flights": [
        {
            "isReturn": false,
            "from": "LIS",
            "to": "RAI",
            "includeRad": false,
            "trips": 48,
            "travelClass": "Economy class"
        }
    ],
    "cars": [
        {
            "carType": "Car",
            "subType": "Petrol Hybrid Car",
            "model": "Medium petrol hybrid car",
            "amount": 560,
            "isMiles": false
        }
    ],
    "motorbikes": [
        {
            "type": "> 500cc",
            "amount": 560,
            "isMiles": false
        }
    ],
    "bus": {
        "consumption": {
            "bus": 6450,
            "coach": 6450,
            "localOrCommuterTrain": 640,
            "longDistanceTrain": 6450,
            "tram": 6450,
            "subway": 6450,
            "taxi": 240
        },
        "isMiles": false
    },
    "secondary": {
        "currency": "USD",
        "duration": "per year",
        "dietStyle": "Heavy meat eater",
        "consumption": {
            "food": "670",
            "pharma": "640",
            "clothes": "7560",
            "paperBased": "4668",
            "it": "6760",
            "tv": "540",
            "motorVehicles": "6780",
            "furniture": "3240",
            "hotels": "76",
            "phone": "350",
            "finance": "867",
            "insurance": "670",
            "education": "350",
            "recreational": "860"
        }
    },
    "bespokeAddOns": {
        "villages": [
            {
                "villageId": 1,
                "adoptionYears": 2
            }
        ],
        "familyMembers": []
    }
  }
);

// Sample output
{
    "advanceFootprint": 168857.38945135658,
    "summary": {
        "house": 448.9029499199999,
        "flights": 10.71813514178153,
        "cars": 0.061594399999999994,
        "motorbikes": 0.07417199999999999,
        "bus": 2.0112689,
        "secondary": 14503.141330994777,
        "bespokeAddOns": {
            "villages": [
                {
                    "id": 1,
                    "name": "Sto. Bosa (La Trinidad)",
                    "population": 137404,
                    "description": "Offset estimated forward carbon footprint of an energy poor community. Enable a typical village in the Philippines to embark on a brighter future.",
                    "image": "",
                    "footprint": 153892.48
                }
            ],
            "total": 153892.48
        }
    }
}

// Constants for advance calculator input options

// Get list of all country codes
const countries = theaSDK.carbonInfo.countries()

// Get list of flight class options
import { classEmissionFactorOptions } from "@thea-protocol/sdk";

// Get list of bike type options
import { bikeTypeOptions } from "@thea-protocol/sdk";

// Get bike emission unit options
import { emissionFactorOptions } from "@thea-protocol/sdk";

// Get secondary consumption duration options
import { durationFactorOptions } from "@thea-protocol/sdk";

// Get secondary consumption currency options
import { currencyFactorOptions } from "@thea-protocol/sdk";

// Get diet style options
import { dietStyleOptions } from "@thea-protocol/sdk";

// Get list of available bespoke add-ons
import { bespokeAddOns } from "@thea-protocol/sdk";

// Get list of available household factors and units
import { householdEmissionFactorOptions } from "@thea-protocol/sdk";

// Get list of vehicle types, sub types and models
import { carEfficiencyOptions } from "@thea-protocol/sdk";
```

- Tokenization informations - returns history or stats informations about tokenization

```js
const tokenizationHistory = await theaSDK.carbonInfo.queryTokenizationHistory();

// Sample output
[
    {
        "id": "1",
        "projectId": "1748",
        "vintage": "2019"
    }
]
const tokenizationStats = await theaSDK.carbonInfo.queryTokenizationStats("1");

// Sample output
{
    "id": "1",
    "projectId": "1748",
    "vintage": "2019",
    "tokenURI": "1.json",
    "activeAmount": "99000",
    "mintedAmount": "100000",
    "retiredAmount": "1000",
    "unwrappedAmount": "0"
}
```

- Offset informations - returns history or stats informations about offset

```js
const offsetHistory = await theaSDK.carbonInfo.queryOffsetHistory();

// Sample output
[
 {
  id: "1-726-0",
  amount: "1000",
  timestamp: "1677058856"
 }
];

const offsetStats = await theaSDK.carbonInfo.queryOffsetStats("1");

// Sample output
[
 {
  id: "1-726-0",
  amount: "1000",
  timestamp: "1677058856",
  token: {
   id: "1",
   projectId: "1748",
   vintage: "2019",
   tokenURI: "1.json",
   activeAmount: "99000",
   mintedAmount: "100000",
   retiredAmount: "1000",
   unwrappedAmount: "0"
  },
  by: {
   id: "0x123..."
  }
 }
];
```

- User balance - returns balances of ERC20, ERC1155 tokens and tokens deposited in options vault for a given wallet address

```js
const balance = await theaSDK.carbonInfo.getUsersBalance("0x123...");

// Sample output
{
    "fungible": {
        "vintage": "1000",
        "rating": "1000",
        "sdg": "1000",
        "nbt": "80000",
        "stable": "9300"
    },
    "nft": {
        "1": "29000"
    }
}
```

- User profile - returns profile of current authenticated user

```js
const profile = await theaSDK.carbonInfo.getUsersProfile();

// Sample output
{
    "result": {
        "userID": "00000186c48bc47f1778c129a9bdb0a2",
 "walletAddress": "0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a",
 "uniqueReferralCode": "ZL6IY2",
 "active": true,
 "referrerID": null,
 "loyalty": {
     "badges": [],
     "tier": 1
 },
 "bridgingBonusPaid": false,
 "offsetBonusPaid": false,
 "outstandingReferrals": {},
 "currentRpBalance": {
     "20230310Z": 0
 },
 "historicRpChanges": [],
 "historicTierChanges": [],
 "historicPositionChanges": null,
 "totalRetiredAmount": 0,
 "invitations": 0
    },
    "error": null,
    "errorMessage": null
}
```

- Query NFT price - return the price of NFT with specified token ID

```js
const price = await theaSDK.carbonInfo.queryTokenPrice(1);
```

## Options

- Create Order - places a option order for the user

```js
// Requires options product ID and quantity as inputs
const order = theaSDK.options.createOrder("00000186c510db6ba6e0a324a79792ab", 1);

// Sample output
{
    "result": {
        "uuid": "1",
 "status": "REQUESTED",
 "txHash": "0x1d219f9f4ff80f5c1f052d5d576e80d6c06972e4a435c5b9e8a47a255d006f98",
 "createdAt": "2023-03-10T11:41:04.287Z",
 "updatedAt": "2023-03-10T11:41:04.287Z",
 "btOptionId": "00000186c510db6ba6e0a324a79792ab",
 "quantity": 1,
 "signature":
     "1C.F59AF258606198D5052B6D32A9EC0A94EC1F5B85A0B44CEB3EAA3DDE62A0D9F6.3955531DE209FFB3FE7671FC385669B489EC1E26C7C830885D19BD2222E49414",
 "premium": 0.0005566631703711085,
 "ethAddr": "0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a"
    },
    "error": null,
    "errorMessage": null
}
```

- Get orders - returns all the orders for current authenticated user

```js
const orders = theaSDK.options.getOrders();

// Sample output
{
    "result": [
        {
     "uuid": "34",
     "status": "PERFORMED",
     "txHash": "0x1d219f5f4ff80f5c1f052d5d576c80d6c06972e4a435c5b9e8a47a255d006f60",
     "createdAt": "2023-03-10T11:09:45.645Z",
     "updatedAt": "2023-03-10T11:09:45.645Z",
     "btOptionId": "00000186c51111b5a3e818eae0ae9bd1",
     "quantity": 1,
     "signature":
         "1C.F59AF258606198D5052B6D32A9EC0A94EC1F5B85A0B44CEB3EAA3DDE62A0D9F6.3955531DE209FFB3FE7671FC385669B489EC1E26C7C830885D19BD2222E49414",
     "premium": 0.0005566631703711085,
     "ethAddr": "0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a"
        }
    ],
    "error": null,
    "errorMessage": null
}
```

- Get current strike and premium - returns one closet call and put option

```js
const result = theaSDK.options.getCurrentStrikeAndPremium();

// Sample output
[
 {
  uuid: "00000186c51111b5a3e818eae0ae9bd1",
  contractId: "00000186c4c423521c1d41a0d03c501a",
  strike: 7,
  optionType: "Call",
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
  optionType: "Put",
  enabled: true,
  updatedAt: "2023-03-09T06:31:01.739Z",
  vaultAddr: "0x185e0a8e68c58dcb6542b0a2c3d35f193ecc1437",
  contractAddr: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
  premiumPrice: 5.800556663166686
 }
];
```

- Exercise option - exercises the option

```js
// Requires order ID and options product ID as inputs
const transactionReceipt = theaSDK.options.exercise("1", "00000186c510db6ba6e0a324a79792ab");
```

## Auth

- Login - authenticate user with backend

```js
const user = theaSDK.auth.login();

// Sample output
{
 result: {
  uuid: "00000356c510db6ba6e0a324a79792ds",
  inviterUuid: null,
  invitationCode: "ZL6IY2",
  profilePrecalc: `{"userID":"00000186c48bc47f1778c129a9bdb0a2","walletAddress":"0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a","uniqueReferralCode":"ZL6IY2","active":true,"referrerID":null,"loyalty":{"badges":[],"tier":1},"bridgingBonusPaid":false,"offsetBonusPaid":false,"outstandingReferrals":{},"currentRpBalance":{"20230310Z":0},"historicRpChanges":[],"historicTierChanges":[],"historicPositionChanges":null,"totalRetiredAmount":0,"invitations":0}`,
  wallets: [
   {
    ethAddr: "0xE63CCe5bEBF27CFa751de8A1550692d3B12b7B7a"
   }
  ]
 },
 error: null,
 errorMessage: null
}
```

- Logout - disconnect user from backend

```js
const user = theaSDK.auth.logout();

// Sample output
{
 result: "OK",
 error: null,
 errorMessage: null
}
```
