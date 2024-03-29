import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { PromiseOrValue, TransactionOptions } from ".";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export interface IRegistryContract extends Contract {
	requests(arg0: PromiseOrValue<BigNumberish>): Promise<
		[number, string, BigNumber, BigNumber] & {
			status: number;
			maker: string;
			tokenId: BigNumber;
			amount: BigNumber;
		}
	>;

	getCharacteristicsBytes(id: BigNumberish, keys: string[]): Promise<string>;

	unwrap(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		offchainAccount: PromiseOrValue<string>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	retire(
		tokenId: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		partnerId: PromiseOrValue<BigNumberish>,
		receiver: PromiseOrValue<string>
	): Promise<ContractTransaction>;

	requestRetireFungible(
		vintage: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		tokenId: PromiseOrValue<BigNumberish>,
		partnerId: PromiseOrValue<BigNumberish>
	): Promise<ContractTransaction>;
}
