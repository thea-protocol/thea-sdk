import { BigNumberish } from "@ethersproject/bignumber";
import { Contract, ContractTransaction } from "@ethersproject/contracts";

export interface ISwapRouterContract extends Contract {
	exactInputSingle(params: {
		tokenIn: string;
		tokenOut: string;
		fee: BigNumberish;
		recipient: string;
		deadline: BigNumberish;
		amountOut: BigNumberish;
		amountInMaximum: BigNumberish;
		sqrtPriceLimitX96: BigNumberish;
	}): Promise<ContractTransaction>;
}
