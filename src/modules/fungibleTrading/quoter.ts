import { IQuoterContract, POOL_FEE, ProviderOrSigner, TheaNetwork } from "../../types";
import { amountShouldBeGTZero, consts, ContractWrapper, validateAddress } from "../../utils";
import Quoter_ABI from "../../abi/Quoter_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export class Quoter extends ContractWrapper<IQuoterContract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, Quoter_ABI, consts[`${network}`].quoterContract);
	}

	/**
	 * Call specified pair's pool to quote the best price
	 * @param tokenIn - token in address
	 * @param tokenOut - token out address
	 * @param amount - amount of token in
	 * @returns - amount of token out in WEI
	 */
	async quoteBestPrice(tokenIn: string, tokenOut: string, amount: BigNumberish): Promise<BigNumber> {
		validateAddress(tokenIn);
		validateAddress(tokenOut);
		amountShouldBeGTZero(amount);

		return this.contract.callStatic.quoteExactInputSingle(tokenIn, tokenOut, POOL_FEE, amount);
	}
}
