import { Signer } from "@ethersproject/abstract-signer";
import { isAddress } from "@ethersproject/address";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { ECSignature, IBaseTokenManagerContract, ProviderOrSigner, TheaERC20Token, TheaNetwork } from "../types";
import { consts } from "./consts";
import { TheaError } from "./theaError";
import BaseTokenManager_ABI from "../abi/BaseTokenManager_ABI.json";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Provider } from "@ethersproject/providers";
import { hexDataLength, hexDataSlice } from "@ethersproject/bytes";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const castAbiInterface = (abi: any) => {
	return abi as ContractInterface;
};

export const validateAddress = (address: string) => {
	if (isAddress(address) === false) {
		throw new TheaError({
			type: "INVALID_ADDRESS",
			message: "Passed address is not valid ethereum address"
		});
	}

	return address.toLowerCase();
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function isSigner(providerOrSigner: any): providerOrSigner is Signer {
	return !!providerOrSigner._isSigner;
}

export function isProvider(providerOrSigner: any): providerOrSigner is Provider {
	return !!providerOrSigner._isProvider;
}
export const signerRequired = (providerOrSigner: ProviderOrSigner) => {
	if (!isSigner(providerOrSigner)) {
		throw new TheaError({
			type: "SIGNER_REQUIRED",
			message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
		});
	}
};

export const getAddress = async (signer: Signer) => signer.getAddress();

export const getBalance = async (signer: Signer) => signer.getBalance();

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function isTypedDataSigner(providerOrSigner: any): providerOrSigner is Signer {
	return !!providerOrSigner._signTypedData;
}

export const typedDataSignerRequired = (providerOrSigner: ProviderOrSigner) => {
	if (!isTypedDataSigner(providerOrSigner) && !isSigner(providerOrSigner)) {
		throw new TheaError({
			type: "TYPED_DATA_SIGNER_REQUIRED",
			message:
				"TypedDataSigner is required for this operation. You must pass in a TypedDataSigner(Wallet) on SDK initialization"
		});
	}
};

export const getERC20ContractAddress = (token: TheaERC20Token, network: TheaNetwork): string => {
	switch (token) {
		case "SDG":
			return consts[`${network}`].sdgTokenContract;
		case "Vintage":
			return consts[`${network}`].vintageTokenContract;
		case "Stable":
			return consts[`${network}`].stableTokenContract;
		case "CurrentNBT":
			return consts[`${network}`].currentNbtTokenContract;
		default:
			return consts[`${network}`].ratingTokenContract;
	}
};

export const getCurrentNBTTokenAddress = async (network: TheaNetwork, providerOrSigner: ProviderOrSigner) => {
	const baseTokenManagerContract = new Contract(
		consts[`${network}`].baseTokenManagerContract,
		castAbiInterface(BaseTokenManager_ABI.abi),
		providerOrSigner
	) as IBaseTokenManagerContract;
	const { vintage } = await baseTokenManagerContract.baseCharacteristics();
	const address = await baseTokenManagerContract.baseTokens(vintage);
	if (BigNumber.from(address).isZero())
		throw new TheaError({ type: "TOKEN_NOT_FOUND", message: `Token by ${vintage} vintage not found` });
	return address;
};

export const amountShouldBeGTZero = (amount: BigNumberish): void => {
	const amountBigNumber = BigNumber.from(amount);
	if (amountBigNumber.lte(0)) {
		throw new TheaError({
			type: "INVALID_TOKEN_AMOUNT_VALUE",
			message: "Amount should be greater than 0"
		});
	}
};

/**
 * Token amount check. Value should be in ton format
 * @param amount amount to be checked
 */
export const tokenAmountShouldBeTon = (amount: BigNumberish): void => {
	const amountBigNumber = BigNumber.from(amount);
	if (amountBigNumber.lte(0) || amountBigNumber.mod(1000).toNumber() !== 0) {
		throw new TheaError({
			type: "INVALID_TOKEN_AMOUNT_VALUE",
			message: "Amount should be a ton. Value must be greater than 0 and divisible by 1000"
		});
	}
};

// Parse a hex signature returned by an RPC call into an `ECSignature`.
export const parseRawSignature = (rawSignature: string): ECSignature => {
	const hexSize = hexDataLength(rawSignature);
	if (hexSize !== 65) {
		throw new TheaError({
			message: "Invalid signature length, expected 65",
			type: "INVALID_SIGNATURE_SIZE"
		});
	}
	// Some providers encode V as 0,1 instead of 27,28.
	const VALID_V_VALUES = [0, 1, 27, 28];
	// Some providers return the signature packed as V,R,S and others R,S,V.
	let v = parseInt(rawSignature.slice(-2), 16);
	if (VALID_V_VALUES.includes(v)) {
		// Format is R,S,V
		v = v >= 27 ? v : v + 27;
		return {
			r: hexDataSlice(rawSignature, 0, 32),
			s: hexDataSlice(rawSignature, 32, 64),
			v
		};
	}
	// Format should be V,R,S
	v = parseInt(rawSignature.slice(2, 4), 16);
	if (!VALID_V_VALUES.includes(v)) {
		throw new TheaError({
			message: "Cannot determine RPC signature layout from V value",
			type: "INVALID_SIGNATURE_LAYOUT"
		});
	}
	v = v >= 27 ? v : v + 27;

	return {
		v,
		r: hexDataSlice(rawSignature, 1, 33),
		s: hexDataSlice(rawSignature, 33, 65)
	};
};
