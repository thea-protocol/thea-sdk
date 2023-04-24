import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { BaseTokenCharactaristics, PromiseOrValue, TransactionOptions } from ".";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export interface IBaseTokenManagerContract extends Contract {
	convert(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	rollTokens(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	recover(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		overrides?: TransactionOptions
	): Promise<ContractTransaction>;

	baseCharacteristics(): Promise<BaseTokenCharactaristics>;

	baseTokens(arg0: PromiseOrValue<BigNumberish>): Promise<string>;

	sigNonces(account: PromiseOrValue<string>): Promise<BigNumber>;

	convertWithSig(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		owner: PromiseOrValue<string>,
		sig: {
			v: string;
			r: string;
			s: string;
			deadline: BigNumberish;
		},
		permit: {
			v: string;
			r: string;
			s: string;
			deadline: BigNumberish;
		}
	): Promise<BigNumber>;

	recoverWithSig(
		id: PromiseOrValue<BigNumberish>,
		amount: PromiseOrValue<BigNumberish>,
		owner: PromiseOrValue<string>,
		sig: {
			v: string;
			r: string;
			s: string;
			deadline: BigNumberish;
		},
		permit: Array<{
			v: string;
			r: string;
			s: string;
			deadline: BigNumberish;
		}>
	): Promise<ContractTransaction>;
}
