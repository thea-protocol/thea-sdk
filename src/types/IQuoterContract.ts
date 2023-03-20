import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

export interface IQuoterContract extends Contract {
	callStatic: {
		quoteExactOutputSingle(
			tokenIn: string,
			tokenOut: string,
			fee: BigNumberish,
			amountOut: BigNumberish,
			sqrtPriceLimitX96: BigNumberish
		): Promise<BigNumber>;
	};
}
