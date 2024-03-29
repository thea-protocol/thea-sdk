import { ContractDetails, QueryError } from "../types";

export type ErrorType =
	| "EMPTY_OPTIONS"
	| "MISSING_PROVIDER"
	| "MISSING_INIT_OPTIONS"
	| "INVALID_TOKEN_AMOUNT_VALUE"
	| "INVALID_REQUEST_ID_VALUE"
	| "INVALID_ADDRESS"
	| "INVALID_TOKEN_ID"
	| "SIGNER_REQUIRED"
	| "TYPED_DATA_SIGNER_REQUIRED"
	| "TRANSACTION_FAILED"
	| "INSUFFICIENT_FUNDS"
	| "NOT_SUPPORED_TOKEN_TYPE"
	| "API_CALL_ERROR"
	| "INVALID_TOKENIZATION_ID_FORMAT"
	| "INVALID_BATCH_ID_FORMAT"
	| "NFT_ORDER_SERILIZATION_ERROR"
	| "INVALID_EMAIL_FORMAT"
	| "INVALID_TOKEN_PRICE"
	| "INVALID_SLIPPAGE_TOLERANCE_VALUE"
	| "INVALID_APP_ID"
	| "INVALID_SIGNATURE_SIZE"
	| "INVALID_SIGNATURE_LAYOUT"
	| "NO_PRICE_LISTING_FOUND"
	| "SELL_ERC1155_ERROR"
	| "INVALID_NONCE"
	| "INVALID_AMOUNT"
	| "INVALID_DEADLINE"
	| "INVALID_YEAR"
	| "INVALID_YEAR_ORDER"
	| "INVALID_YEAR_IN_QUERY"
	| "YEAR_OF_BIRTH_GREATER_THAN_FIRST_LOCATION_YEAR"
	| "NETWORK_MISMATCH"
	| "INVALID_CHUNK_SIZE"
	| "SIGNER_REQUIRES_PROVIDER"
	| "MISSING_CURRENT_NBT_CONTRACT_ADDRESSS"
	| "SUBGRAPH_CALL_ERROR"
	| "TOKEN_NOT_FOUND"
	| "INVALID_OPTION_PRODUCT_ID"
	| "INVALID_AIRPORT_CODE"
	| "INVALID_VILLAGE_ID";

export type ErrorProps = {
	type: ErrorType;
	message: string;
};
export class TheaError extends Error {
	readonly type: ErrorType;
	constructor(props: ErrorProps) {
		super(props.message);
		this.type = props.type;
		Object.setPrototypeOf(this, TheaError.prototype);
	}
}

export class TheaContractCallError extends TheaError {
	readonly contractDetails: ContractDetails & { contractFunction: string };
	constructor(props: ErrorProps, details: ContractDetails & { contractFunction: string }) {
		super(props);
		this.contractDetails = details;
		Object.setPrototypeOf(this, TheaContractCallError.prototype);
	}
}

export class TheaAPICallError extends TheaError {
	constructor(readonly message: string, readonly method: "GET" | "POST", readonly endpoint: string) {
		super({ type: "API_CALL_ERROR", message });
		Object.setPrototypeOf(this, TheaAPICallError.prototype);
	}
}

export class TheaSubgraphError extends TheaError {
	readonly queryErrors: QueryError[];
	constructor(readonly message: string, queryErrors: QueryError[]) {
		super({ type: "SUBGRAPH_CALL_ERROR", message });
		this.queryErrors = queryErrors;
		Object.setPrototypeOf(this, TheaSubgraphError.prototype);
	}
}
