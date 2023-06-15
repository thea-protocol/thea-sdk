/* eslint-disable security/detect-object-injection */
import { consts, getERC20ContractAddress, ISO_CODES, TheaError, TheaSubgraphError } from "../utils";
import co2dataset from "../co2dataset.json";
import airportDataset from "../airportDataset.json";
import {
	AdvancedFootprint,
	AirportDataSet,
	BespokeAddOnDetails,
	CarDetails,
	ClientProfile,
	Co2DataSet,
	EnergyConsumptionDetails,
	EstimatedFootprint,
	FlightDetails,
	FootprintDetail,
	FootprintQuery,
	FootprintSummary,
	GraphqlQuery,
	HouseholdEmissionFactors,
	HttpResponseIn,
	MotorbikeDetails,
	OffsetHistory,
	OffsetStats,
	OptionsVaultBalance,
	ProviderOrSigner,
	QueryError,
	QueryErrorResponse,
	QueryResponse,
	SecondaryConsumption,
	SecondaryDetails,
	TheaERC1155Balance,
	TheaERC20Token,
	TheaNetwork,
	TokenInfoList,
	TokenizationHistory,
	TokenizationStats,
	UserBalance,
	Village
} from "../types";
import { HttpClient, TheaERC20 } from "./shared";
import {
	householdEmissionFactors,
	busEmissionFactors,
	classEmissionFactors,
	RADIATIVE_FORCING_FACTOR,
	carEfficiency,
	bikeTypes,
	emissionFactors,
	durationFactors,
	currencyFactors,
	emissionFactors_DOLLAR,
	villages,
	ruralCommunityFootPrint
} from "src/utils/datasets";

export const tokenizationHistoryQuery: GraphqlQuery = {
	query: `{
		tokens {
			id
			projectId
			vintage
		}
	}`
};
export const tokenizationStatsQuery = (id: string): GraphqlQuery => ({
	query: `
			query ($id: ID!){
				token(id: $id) {
					id
					projectId
					vintage
					tokenURI
					activeAmount
					mintedAmount
					retiredAmount
					unwrappedAmount
				}
			}
		  `,
	variables: {
		id
	}
});
export const offsetHistoryQuery: GraphqlQuery = {
	query: `{
		retireds {
		  id
		  amount
		  timestamp
		}
	  }`
};
export const offsetStatsQuery = (tokenId: string): GraphqlQuery => ({
	query: `
			query ($token: String!){
				retireds(where: {token: $token}) {
					id
					amount
					timestamp
					token {
						id
						projectId
						vintage
						tokenURI
						activeAmount
						mintedAmount
						retiredAmount
						unwrappedAmount
					}
					by {
						id
					}
				}
			}
		  `,
	variables: {
		token: tokenId
	}
});

export const theaERC1155BalancesQuery = (owner: string) => ({
	query: `
			query ($owner: String!){
          theaERC1155Balances(
            where: {owner: $owner}
          ) {
            amount
            token {
              id
            }
          }
          optionsVaultBalances(
            where: {owner: $owner}
          ) {
            amount
            token {
              id
              symbol
            }
          }
			}
  `,
	variables: {
		owner
	}
});
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
export class CarbonInfo {
	private dataSet: Co2DataSet;
	private airportDataset: AirportDataSet[];
	private lastYearInDataset: number;
	readonly httpClient: HttpClient;
	readonly apiClient: HttpClient;
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		this.dataSet = co2dataset as Co2DataSet;
		this.airportDataset = airportDataset as AirportDataSet[];
		this.lastYearInDataset = this.dataSet["USA"].data[this.dataSet["USA"].data.length - 1].year;
		this.httpClient = new HttpClient(consts[`${network}`].subGraphUrl, false);
		this.apiClient = new HttpClient(consts[`${network}`].theaApiBaseUrl);
	}

	/**
	 * Returns summary history of tokenizations from subgraph
	 * @returns TokenizationHistory[] @see TokenizationHistory
	 */
	async queryTokenizationHistory(): Promise<TokenizationHistory[]> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ tokens: TokenizationHistory[] }> | QueryErrorResponse
		>("", tokenizationHistoryQuery);

		return this.handleResponse<{ tokens: TokenizationHistory[] }, TokenizationHistory[]>(response, "tokens");
	}

	/**
	 * Returns stats info of tokenization by passing ID from subgraph
	 * @param id - id of token
	 * @returns TokenizationStats @see TokenizationStats
	 */
	async queryTokenizationStats(id: string): Promise<TokenizationStats> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ token: TokenizationStats }> | QueryErrorResponse
		>("", tokenizationStatsQuery(id));

		return this.handleResponse<{ token: TokenizationStats }, TokenizationStats>(response, "token");
	}

	/**
	 * Returns summary history of offsets from subgraph
	 * @returns OffsetHistory[] @see OffsetHistory
	 */
	async queryOffsetHistory(): Promise<OffsetHistory[]> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ retireds: OffsetHistory[] }> | QueryErrorResponse
		>("", offsetHistoryQuery);

		return this.handleResponse<{ retireds: OffsetHistory[] }, OffsetHistory[]>(response, "retireds");
	}

	/**
	 * Returns stats info of offset by passing ID from subgraph
	 * @param id - id of token
	 * @returns OffsetStats @see OffsetStats
	 */
	async queryOffsetStats(id: string): Promise<OffsetStats[]> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			QueryResponse<{ retireds: OffsetStats[] }> | QueryErrorResponse
		>("", offsetStatsQuery(id));

		return this.handleResponse<{ retireds: OffsetStats[] }, OffsetStats[]>(response, "retireds");
	}

	/**
	 * Returns balances of ERC20 and ERC1155 tokens for a given wallet address
	 * @param walletAddress - wallet address of user
	 * @returns UserBalance @see UserBalance
	 */
	async getUsersBalance(walletAddress: string): Promise<UserBalance> {
		const response = await this.httpClient.post<
			GraphqlQuery,
			| QueryResponse<{ theaERC1155Balances: TheaERC1155Balance[]; optionsVaultBalances: OptionsVaultBalance[] }>
			| QueryErrorResponse
		>("", theaERC1155BalancesQuery(walletAddress));

		if ("errors" in response)
			throw new TheaSubgraphError(
				`Subgraph call error when trying to query theaERC1155Balances`,
				response.errors as QueryError[]
			);

		const balances = response.data.theaERC1155Balances;
		const vaultBalances = response.data.optionsVaultBalances;

		const nft = this.getNFTAmounts(balances);
		const optionsDeposit = this.getVaultDepositAmounts(vaultBalances);
		const fungible = await this.getFungibleAmounts(walletAddress);
		const userBalance: UserBalance = {
			optionsDeposit,
			fungible,
			nft
		};
		return userBalance;
	}

	/**
	 * Get price of NFT
	 * @param tokenId - token ID of NFT
	 * @returns - price of NFT
	 */
	async queryTokenPrice(tokenId: number): Promise<number> {
		const tokenList = await this.apiClient.post<Record<string, never>, HttpResponseIn<TokenInfoList[]>>(
			`/tokens/list`,
			{}
		);
		const token = tokenList.result.find(({ id }) => id === tokenId);
		if (!token) throw new TheaError({ type: "INVALID_TOKEN_ID", message: "Token ID must be valid" });
		return token.price;
	}

	/**
	 * Returns authenticated users profile
	 * @returns ClientProfile @see ClientProfile
	 */
	getUsersProfile(): Promise<HttpResponseIn<ClientProfile>> {
		return this.apiClient.get<HttpResponseIn<ClientProfile>>("/myprofile");
	}

	private getNFTAmounts(balances: TheaERC1155Balance[]): Record<string, string> {
		return balances.reduce((acc, cur: TheaERC1155Balance) => {
			const tokenId = cur.token.id;
			acc[`${tokenId}`] = cur.amount;
			return acc;
		}, {} as Record<string, string>);
	}

	private getVaultDepositAmounts(balances: OptionsVaultBalance[]): Record<string, string> {
		const currentNBT = getERC20ContractAddress("CurrentNBT", this.network);
		return balances.reduce((acc, cur: OptionsVaultBalance) => {
			if (cur.token.id === currentNBT.toLowerCase()) acc[`currentNBT`] = cur.amount;
			const tokenSymbol = cur.token.symbol;
			acc[`${tokenSymbol}`] = cur.amount;
			return acc;
		}, {} as Record<string, string>);
	}

	private async getFungibleAmounts(walletAddress: string): Promise<{
		vintage: string;
		rating: string;
		sdg: string;
		nbt: string;
		stable: string;
	}> {
		const tokens = ["SDG", "Vintage", "Rating", "CurrentNBT", "Stable"];
		const fungible: {
			vintage: string;
			rating: string;
			sdg: string;
			nbt: string;
			stable: string;
		} = {
			vintage: "0",
			rating: "0",
			sdg: "0",
			nbt: "0",
			stable: "0"
		};
		for (const token of tokens) {
			const response = await new TheaERC20(
				this.providerOrSigner,
				getERC20ContractAddress(token as TheaERC20Token, this.network)
			).getBalance(walletAddress);
			const amount = response.toString();
			switch (token) {
				case "SDG":
					fungible.sdg = amount;
					break;
				case "Vintage":
					fungible.vintage = amount;
					break;
				case "Rating":
					fungible.rating = amount;
					break;
				case "CurrentNBT":
					fungible.nbt = amount;
					break;
				default:
					fungible.stable = amount;
					break;
			}
		}

		return fungible;
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

	/**
	 * Estimates footprint based on co2 emission per capita using co2 emission dataset
	 * It accepts a ordered list (array) of countries and years.
	 * @param yearOfBirth Year of birth of the person for which we are calculating co2 emission
	 * @param query Array of countries and years
	 * @param query.year Year of specified country to which we are calculating co2 emission. If null, it will use the last year in the dataset
	 * @param query.isoCode ISO code of the country @see ISO_CODES
	 * @param bespokeAddOns ISO code of the country @see BespokeAddOnDetails
	 * @returns
	 */
	estimateFootprint(
		yearOfBirth: number,
		query: FootprintQuery[],
		bespokeAddOns?: BespokeAddOnDetails
	): EstimatedFootprint {
		const estimate: EstimatedFootprint = {
			footprint: 0,
			summary: [],
			details: [],
			bespokeAddOns: { familyMembers: [], villages: [], total: 0 }
		};
		if (query.length === 0) return estimate;
		this.validateYear(yearOfBirth);
		this.validateFootprintQuery(yearOfBirth, query);

		const summaries: FootprintSummary[] = [];
		const details: FootprintDetail[] = [];
		for (let i = 0; i < query.length; i++) {
			const isoCode = query[`${i}`].isoCode;
			const to = query[`${i}`].year;
			let from = yearOfBirth;
			if (i !== 0) {
				from = query[i - 1].year!;
			}

			const { summary, countryDetails } = this.buildFootprintSummary(from, to, isoCode);

			summaries.push(summary as FootprintSummary);
			details.push(...countryDetails);
			estimate.footprint += summary.co2Emission;
		}
		estimate.summary = summaries;
		estimate.details = details;
		if (bespokeAddOns) {
			bespokeAddOns?.villages?.forEach(({ villageId, adoptionYears }) => {
				const { footprint: villageFootprint, village } = this.calculateVillageFootprint(villageId, adoptionYears);
				estimate.bespokeAddOns.villages.push({ ...village, footprint: villageFootprint });
				estimate.bespokeAddOns.total += villageFootprint;
				estimate.footprint += villageFootprint;
			});

			bespokeAddOns?.familyMembers?.forEach(({ yearOfBirth, query }) => {
				const familyFootprint = this.estimateFootprint(yearOfBirth, query).footprint;
				estimate.bespokeAddOns.familyMembers.push(familyFootprint);
				estimate.bespokeAddOns.total += familyFootprint;
				estimate.footprint += familyFootprint;
			});
		}
		return estimate;
	}

	estimateAdvancedFootprint({
		house,
		flights,
		cars,
		motorbikes,
		bus,
		secondary,
		bespokeAddOns
	}: EnergyConsumptionDetails): AdvancedFootprint {
		const footprint: AdvancedFootprint = {
			advanceFootprint: 0,
			summary: {
				house: 0,
				flights: 0,
				cars: 0,
				motorbikes: 0,
				bus: 0,
				secondary: 0,
				bespokeAddOns: {
					villages: [],
					total: 0
				}
			}
		};
		for (const key in house) {
			if (Object.prototype.hasOwnProperty.call(house, key)) {
				const { amount, unit } = house[key as keyof HouseholdEmissionFactors];
				const houseFootprint =
					(amount *
						householdEmissionFactors[key as keyof HouseholdEmissionFactors][
							unit as keyof HouseholdEmissionFactors[keyof HouseholdEmissionFactors]
						]) /
					1000;
				footprint.summary.house += houseFootprint;
				footprint.advanceFootprint += houseFootprint;
			}
		}
		flights?.forEach((flight) => {
			const flightFootprint = this.calculateFlightFootprint(flight);
			footprint.summary.flights += flightFootprint;
			footprint.advanceFootprint += flightFootprint;
		});
		cars?.forEach((car) => {
			const carFootprint = this.calculateCarFootprint(car);
			footprint.summary.cars += carFootprint;
			footprint.advanceFootprint += carFootprint;
		});
		motorbikes?.forEach((motorbike) => {
			const motorbikeFootprint = this.calculateMotorbikeFootprint(motorbike);
			footprint.summary.motorbikes += motorbikeFootprint;
			footprint.advanceFootprint += motorbikeFootprint;
		});
		if (bus) {
			for (const key in bus.consumption) {
				if (Object.prototype.hasOwnProperty.call(bus.consumption, key)) {
					const busFootprint =
						(bus.consumption[key as keyof typeof busEmissionFactors] *
							busEmissionFactors[key as keyof typeof busEmissionFactors]) /
						1000;
					footprint.summary.bus += busFootprint;
					footprint.advanceFootprint += busFootprint;
				}
			}
		}
		if (secondary) {
			const secondaryFootprint = this.calculateSecondaryFootprint(secondary);
			footprint.summary.secondary = secondaryFootprint;
			footprint.advanceFootprint += secondaryFootprint;
		}
		bespokeAddOns?.villages?.forEach(({ villageId, adoptionYears }) => {
			const { footprint: villageFootprint, village } = this.calculateVillageFootprint(villageId, adoptionYears);
			footprint.summary.bespokeAddOns.villages.push({ ...village, footprint: villageFootprint });
			footprint.summary.bespokeAddOns.total += villageFootprint;
			footprint.advanceFootprint += villageFootprint;
		});
		return footprint;
	}

	/**
	 * @returns List of countries with iso code
	 */
	countries(): { country: string; isoCode: ISO_CODES }[] {
		return Object.values(this.dataSet).map((data) => ({ country: data.country, isoCode: data.isoCode }));
	}

	private buildFootprintSummary(
		from: number,
		to: number | null,
		isoCode: ISO_CODES
	): { summary: FootprintSummary; countryDetails: FootprintDetail[] } {
		const toYear = to ?? this.lastYearInDataset;

		const countryDataSet = this.dataSet[`${isoCode}`];
		const data = countryDataSet.data.filter((data) => data.year >= from && data.year <= toYear);
		const co2Emission = data.reduce(function (acc, obj) {
			return acc + (obj.co2_per_capita ?? 0);
		}, 0);

		const summary = {
			country: countryDataSet.country,
			isoCode,
			from,
			to: toYear,
			co2Emission
		};
		const details: FootprintDetail[] = data.map((d) => {
			return {
				year: d.year,
				co2Emission: d.co2_per_capita ?? 0,
				country: countryDataSet.country,
				isoCode
			};
		});
		return { summary, countryDetails: details };
	}
	private validateYear(year: number) {
		if (year < 1911 || year > this.lastYearInDataset) {
			throw new TheaError({
				type: "INVALID_YEAR",
				message: `Allowed year range is between 1911 till ${this.lastYearInDataset}`
			});
		}

		return;
	}

	// Check if the year is in ascending order. It allows null value for last element which represents last year in dataset
	private validateFootprintQuery(yearOfBirth: number, query: FootprintQuery[]): void {
		// Check if year of birth is bigger then first year in location
		if (query[0].year && yearOfBirth > query[0].year)
			throw new TheaError({
				type: "YEAR_OF_BIRTH_GREATER_THAN_FIRST_LOCATION_YEAR",
				message: "Year of birth cannot be greater than first location year"
			});

		for (let i = 0; i < query.length - 1; i++) {
			const firstYear = query[`${i}`].year;
			const secondYear = query[`${i + 1}`].year;

			if (!firstYear || (!secondYear && i !== query.length - 2)) {
				throw new TheaError({
					type: "INVALID_YEAR_IN_QUERY",
					message: "Year cannot be null in the middle of the query. Null value is allowed only for last element"
				});
			}

			if (!secondYear && i === query.length - 2) continue;

			if (firstYear > secondYear!) {
				throw new TheaError({
					type: "INVALID_YEAR_ORDER",
					message: "Year in query should be in ascending order"
				});
			}

			this.validateYear(firstYear);
			this.validateYear(secondYear!);
		}

		return;
	}

	private calculateFlightFootprint(flight: FlightDetails): number {
		const getAirportCoordinates = (airportCode: string) => {
			const res = this.airportDataset.find((item) => item.code == airportCode);
			if (!res) {
				return [0, 0];
			}
			return [res.lat, res.long];
		};
		const toRad = (val: number) => (val * Math.PI) / 180;
		const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
			const R = 6371;
			const dLat = toRad(lat2 - lat1);
			const dLon = toRad(lon2 - lon1);
			lat1 = toRad(lat1);
			lat2 = toRad(lat2);
			const a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return R * c;
		};
		const findAirportDistance = (from: string, to: string) => {
			const [lat1, lon1] = getAirportCoordinates(from);
			const [lat2, lon2] = getAirportCoordinates(to);
			return calcDistance(lat1, lon1, lat2, lon2);
		};
		const { from, includeRad, isReturn, to, travelClass, trips } = flight;
		const distance = findAirportDistance(from, to);
		const emissionFactor = classEmissionFactors[travelClass];
		let emission = distance * emissionFactor * trips * (isReturn ? 2 : 1);
		if (includeRad) {
			emission = emission * RADIATIVE_FORCING_FACTOR;
		}
		return emission;
	}

	private calculateCarFootprint(car: CarDetails): number {
		const { amount, carType, isMiles, model, subType } = car;
		const emissionFactor = 1e-6;
		try {
			const efficiency = carEfficiency[carType][subType][model]["average value"];
			const mileage = amount * (isMiles ? 1.609344 : 1);
			return mileage * emissionFactor * efficiency;
		} catch (error) {
			return 0;
		}
	}

	private calculateMotorbikeFootprint(motorbike: MotorbikeDetails): number {
		const { amount, isMiles, type } = motorbike;
		const milage = isMiles ? amount * 1.609344 : amount;
		const efficiency = bikeTypes[type];
		const unit = "g/km";
		return milage * emissionFactors[unit] * efficiency;
	}

	private calculateSecondaryFootprint(secondary: SecondaryDetails) {
		const { consumption, currency, dietStyle, duration } = secondary;
		const durationFactor = durationFactors[duration];
		const currencyFactor = currencyFactors[currency];
		let emission = 0;
		for (const key in consumption) {
			if (Object.prototype.hasOwnProperty.call(consumption, key)) {
				const amount = consumption[key as keyof SecondaryConsumption];
				let emissionFactor = 0;
				if (typeof emissionFactors_DOLLAR[key as keyof SecondaryConsumption] === "number") {
					emissionFactor = emissionFactors_DOLLAR[key as keyof SecondaryConsumption] as number;
				} else {
					const product = emissionFactors_DOLLAR[
						key as keyof SecondaryConsumption
					] as (typeof emissionFactors_DOLLAR)["food"];
					emissionFactor = product[dietStyle as keyof (typeof emissionFactors_DOLLAR)["food"]];
				}
				emission += (amount * currencyFactor * emissionFactor * 1e-3) / durationFactor;
			}
		}
		return emission;
	}

	calculateVillageFootprint(
		villageId: number,
		adoptionYears: number
	): {
		village: Village;
		footprint: number;
	} {
		const village = villages.find((village) => village.id === villageId);
		if (!village) {
			throw new TheaError({
				type: "INVALID_VILLAGE_ID",
				message: "Provided village ID is invalid"
			});
		}
		return { village, footprint: village.population * adoptionYears * ruralCommunityFootPrint };
	}
}
