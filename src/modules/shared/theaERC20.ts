import { IERC20Contract, ProviderOrSigner } from "../../types";
import { ContractWrapper, TheaError, validateAddress } from "../../utils";
import TheaERC20_ABI from "../../abi/TheaERC20_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { execute } from "./execute";
import { ContractReceipt } from "@ethersproject/contracts";

export class TheaERC20 extends ContractWrapper<IERC20Contract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, address: string) {
		super(providerOrSigner, TheaERC20_ABI, address);
	}

	async getBalance(owner: string): Promise<BigNumber> {
		validateAddress(owner);
		return this.contract.balanceOf(owner);
	}

	async checkERC20Balance(owner: string, amount: BigNumberish): Promise<void> {
		validateAddress(owner);
		const balance = await this.contract.balanceOf(owner);
		if (balance.lt(amount)) {
			throw new TheaError({ type: "INSUFFICIENT_FUNDS", message: "Insufficient Thea ERC20 funds" });
		}
	}

	async approveERC20(owner: string, spender: string, amount: BigNumberish) {
		const allowance = await this.allowance(owner, spender);
		if (allowance.lt(amount)) {
			await this.approve(spender, amount);
		}
	}

	async allowance(owner: string, spender: string) {
		validateAddress(owner);
		validateAddress(spender);
		return this.contract.allowance(owner, spender);
	}

	async approve(spender: string, amount: BigNumberish): Promise<ContractReceipt> {
		validateAddress(spender);
		return execute(this.contract.approve(spender, amount), { ...this.contractDetails, contractFunction: "approve" });
	}
}
