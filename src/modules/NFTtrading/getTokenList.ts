import { GraphqlQuery, QueryError, QueryErrorResponse, QueryResponse, TheaNetwork, TokenInfo } from "../../types";
import { consts, TheaSubgraphError } from "../../utils";
import { HttpClient } from "../shared";

export const tokenInfo: GraphqlQuery = {
	query: `{
		tokens(orderBy: projectId) {
			id
			tokenURI
			projectId
			vintage
			activeAmount
			mintedAmount
			retiredAmount
			unwrappedAmount
		  }
	}`
};
export class GetTokenList {
	readonly httpClient: HttpClient;
	readonly network: TheaNetwork;

	constructor(network: TheaNetwork) {
		this.network = network;
		this.httpClient = new HttpClient(consts[`${network}`].subGraphUrl, false);
	}
	async getTokenList() {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ tokens: TokenInfo[] }> | QueryErrorResponse
		>("", tokenInfo);

		const tokens = this.handleResponse<{ tokens: TokenInfo[] }, TokenInfo[]>(response, "tokens");
		return tokens.reduce((acc, token: TokenInfo) => {
			const projectId = token.projectId;
			if (acc[`${projectId}`]) {
				acc[`${projectId}`].push(token);
			} else {
				acc[`${projectId}`] = [token];
			}
			return acc;
		}, {} as Record<string, TokenInfo[]>);
	}
	private handleResponse<T, Response>(
		response: QueryResponse<T> | QueryErrorResponse,
		responseProperty: keyof T
	): Response {
		if ("errors" in response)
			throw new TheaSubgraphError(
				`Subgraph call error when trying to query ${responseProperty.toString()}`,
				response.errors as QueryError[]
			);

		// eslint-disable-next-line security/detect-object-injection
		return response.data[responseProperty] as Response;
	}
}
