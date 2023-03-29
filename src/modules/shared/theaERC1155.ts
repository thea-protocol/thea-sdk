import { EIP712Signature, IERC1155Contract, ProviderOrSigner, TheaNetwork } from "../../types";
import { consts, ContractWrapper, parseRawSignature, TheaError, validateAddress } from "../../utils";
import TheaERC1155_ABI from "../../abi/TheaERC1155_ABI.json";
import { execute } from "./execute";
import { BigNumberish } from "@ethersproject/bignumber";
import { ContractReceipt } from "@ethersproject/contracts";
import { TypedDataSigner } from "@ethersproject/abstract-signer";

export class TheaERC1155 extends ContractWrapper<IERC1155Contract> {
	constructor(readonly providerOrSigner: ProviderOrSigner, readonly network: TheaNetwork) {
		super(providerOrSigner, TheaERC1155_ABI, consts[`${network}`].theaERC1155Contract);
	}

	async checkERC1155Balance(owner: string, tokenId: BigNumberish, amount: BigNumberish): Promise<void> {
		const balance = await this.contract.balanceOf(owner, tokenId);
		if (balance.lt(amount)) {
			throw new TheaError({ type: "INSUFFICIENT_FUNDS", message: "Insufficient Thea ERC1155 funds" });
		}
	}

	async approveERC1155(owner: string, spender: string): Promise<void> {
		const isApproved = await this.isApprovedForAll(owner, spender);
		if (!isApproved) {
			await this.setApprovalForAll(spender);
		}
		return;
	}

	async isApprovedForAll(owner: string, spender: string): Promise<boolean> {
		validateAddress(owner);
		validateAddress(spender);
		return this.contract.isApprovedForAll(owner, spender);
	}

	async setApprovalForAll(spender: string): Promise<ContractReceipt> {
		validateAddress(spender);
		return execute(this.contract.setApprovalForAll(spender, true), {
			...this.contractDetails,
			contractFunction: "setApprovalForAll"
		});
	}

	async permit(owner: string, operator: string): Promise<EIP712Signature> {
		validateAddress(owner);
		validateAddress(operator);

		const name = await this.contract.name();

		const domain = {
			name,
			version: "1",
			chainId: this.network,
			verifyingContract: this.contractDetails.address
		};

		const types = {
			Permit: [
				{ name: "owner", type: "address" },
				{ name: "operator", type: "address" },
				{ name: "approved", type: "bool" },
				{ name: "nonce", type: "uint256" },
				{ name: "deadline", type: "uint256" }
			]
		};

		const nonce = await this.contract.sigNonces(owner);
		const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

		const value = {
			owner,
			operator,
			approved: true,
			nonce,
			deadline
		};

		const rawSignature = await (this.providerOrSigner as TypedDataSigner)._signTypedData(domain, types, value);

		const ecSignature = parseRawSignature(rawSignature);

		return { ...ecSignature, deadline };
	}
}
