import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { consts, Options, TheaError, TheaNetwork } from "../../src";
import {
	mockOptionsOrder,
	mockOrders,
	mockPrepareOptionsOrder,
	optionsProducts,
	PRIVATE_KEY,
	WALLET_ADDRESS
} from "../mocks";
import * as utils from "../../src/utils/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";
import TheaOptions_ABI from "../../src/abi/TheaOptions_ABI.json";

consts[TheaNetwork.GANACHE].relayerUrl = "https://api.defender.openzeppelin.com/";

const iface = new Interface(TheaOptions_ABI.abi);
iface.encodeFunctionData = jest.fn();

jest.mock("@ethersproject/contracts", () => {
	return {
		Contract: jest.fn().mockImplementation(() => {
			return {
				exercise: jest.fn().mockReturnValue(
					Promise.resolve({
						wait: jest.fn().mockResolvedValue({
							to: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
							from: "0x123",
							contractAddress: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42"
						})
					})
				),
				deposit: jest.fn().mockReturnValue(
					Promise.resolve({
						wait: jest.fn().mockResolvedValue({
							to: "0x75a255e9613a9e11ebc5308bc00d26ffa92a28c3",
							from: "0x123",
							contractAddress: "0x75a255e9613a9e11ebc5308bc00d26ffa92a28c3"
						})
					})
				),
				withdraw: jest.fn().mockReturnValue(
					Promise.resolve({
						wait: jest.fn().mockResolvedValue({
							to: "0x75a255e9613a9e11ebc5308bc00d26ffa92a28c3",
							from: "0x123",
							contractAddress: "0x75a255e9613a9e11ebc5308bc00d26ffa92a28c3"
						})
					})
				),
				baseToken: jest.fn().mockReturnValue(Promise.resolve("0x5B518de3F2743A33f79f7a312e10Eeac6f778A6c")),
				usdc: jest.fn().mockReturnValue(Promise.resolve("0x014349F1C543038a76384cFC1A68f1881AFc6B0a")),
				balanceOf: jest.fn().mockResolvedValue(BigNumber.from(200)),
				sigNonces: jest.fn().mockResolvedValue(0),
				interface: iface
			};
		})
	};
});

jest.mock("../../src/modules/shared", () => {
	return {
		...jest.requireActual("../../src/modules/shared"),
		checkBalance: jest.fn(),
		approve: jest.fn(),
		permit: jest.fn(),
		execute: jest.fn().mockImplementation(() => {
			return {
				to: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
				from: "0x123",
				contractAddress: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42"
			};
		}),
		relay: jest.fn().mockImplementation(() => {
			return {
				to: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
				from: "0x123",
				contractAddress: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42"
			};
		}),
		TheaERC20: jest.fn().mockImplementation(() => {
			return {
				checkERC20Balance: jest.fn(),
				approveERC20: jest.fn()
			};
		})
	};
});

jest.mock("../../src/utils/utils", () => {
	return {
		__esModule: true,
		...jest.requireActual("../../src/utils/utils"),
		getBalance: jest
			.fn()
			.mockImplementationOnce(() => BigNumber.from("10000000000000000"))
			.mockImplementationOnce(() => BigNumber.from(0)),
		getAddress: jest.fn().mockImplementation(() => WALLET_ADDRESS)
	};
});

describe("Options", () => {
	const signer = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	const network = TheaNetwork.GANACHE;
	let options: Options;

	beforeEach(() => {
		options = new Options(signer, network);
	});

	describe("getCurrentStrikeAndPremium", () => {
		it("should return current strike and premium", async () => {
			jest.spyOn(options.httpClient, "post").mockResolvedValue(optionsProducts);
			const result = await options.getCurrentStrikeAndPremium();
			expect(result).toEqual(optionsProducts);
		});
	});

	describe("getOrders", () => {
		it("should return all orders", async () => {
			const httpClient = jest.spyOn(options.httpClient, "post").mockResolvedValueOnce(mockOrders);
			const result = await options.getOrders();
			expect(result).toEqual(mockOrders);
			expect(httpClient).toBeCalledWith("/bt_options_orders/list", {});
		});
	});

	describe("createOrder", () => {
		it("should create put options order", async () => {
			jest.spyOn(options.httpClient, "post").mockImplementation(async (url) => {
				if (url === "/bt_options/list") {
					return optionsProducts;
				} else if (url === "/bt_options_orders/prepare") {
					return mockPrepareOptionsOrder;
				} else {
					return mockOptionsOrder;
				}
			});
			const result = await options.createOrder("00000186c510db6ba6e0a324a79792ab", 1);
			expect(result).toEqual(mockOptionsOrder);
		});

		it("should create call options order", async () => {
			jest.spyOn(options.httpClient, "post").mockImplementation(async (url) => {
				if (url === "/bt_options/list") {
					return optionsProducts;
				} else if (url === "/bt_options_orders/prepare") {
					return mockPrepareOptionsOrder;
				} else {
					return mockOptionsOrder;
				}
			});
			const result = await options.createOrder("00000186c51111b5a3e818eae0ae9bd1", 10);
			expect(result).toEqual(mockOptionsOrder);
		});

		it("should throw error if amount is not valid", async () => {
			await expect(options.createOrder("00000186c510db6ba6e0a324a79792ab", 0)).rejects.toThrow(
				new TheaError({
					type: "INVALID_TOKEN_AMOUNT_VALUE",
					message: "Amount should be greater than 0"
				})
			);
		});

		it("should throw error if options product id is invalid", async () => {
			jest.spyOn(options.httpClient, "post").mockImplementation(async (url) => {
				if (url === "/bt_options/list") {
					return optionsProducts;
				} else if (url === "/bt_options_orders/prepare") {
					return mockPrepareOptionsOrder;
				} else {
					return mockOptionsOrder;
				}
			});

			await expect(options.createOrder("00000186c510db6ba6e0a324a79792az", 1)).rejects.toThrow(
				new TheaError({ type: "INVALID_OPTION_PRODUCT_ID", message: `Options product id is invalid` })
			);
		});
	});

	describe("exercise", () => {
		it("should exercise option", async () => {
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const httpClient = jest.spyOn(options.httpClient, "post").mockResolvedValueOnce(optionsProducts);

			await options.exercise("1", "00000186c510db6ba6e0a324a79792ab");

			expect(signerRequiredSpy).toHaveBeenCalledWith(signer);
			expect(httpClient).toBeCalledWith("/bt_options/list", {});
		});

		it("should relay transaction on insufficient gas", async () => {
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const httpClient = jest.spyOn(options.httpClient, "post").mockResolvedValueOnce(optionsProducts);

			const result = await options.exercise("1", "00000186c510db6ba6e0a324a79792ab");

			expect(signerRequiredSpy).toHaveBeenCalledWith(signer);
			expect(httpClient).toBeCalledWith("/bt_options/list", {});
			expect(result).toMatchObject({
				to: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42",
				from: "0x123",
				contractAddress: "0x65bf2642d5ca9b0cbc6f15ad126d7084c09dba42"
			});
		});

		it("should throw error if options product id is invalid", async () => {
			const signerRequiredSpy = jest.spyOn(utils, "signerRequired");
			const httpClient = jest.spyOn(options.httpClient, "post").mockResolvedValueOnce(optionsProducts);

			expect(signerRequiredSpy).toHaveBeenCalledWith(signer);
			await expect(options.exercise("1", "00000186c510db6ba6e0a324a79792az")).rejects.toThrow(
				new TheaError({ type: "INVALID_OPTION_PRODUCT_ID", message: `Options product id is invalid` })
			);
			expect(httpClient).toBeCalledWith("/bt_options/list", {});
		});

		it("should throw error that signer is required", async () => {
			options = new Options(new JsonRpcProvider(), network);
			await expect(options.exercise("1", "00000186c510db6ba6e0a324a79792ab")).rejects.toThrow(
				new TheaError({
					type: "SIGNER_REQUIRED",
					message: "Signer is required for this operation. You must pass in a signer on SDK initialization"
				})
			);
		});
	});
});
