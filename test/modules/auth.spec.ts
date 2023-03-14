import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Auth, TheaError, TheaNetwork } from "../../src";
import { mockClient, mockLoginRequest, PRIVATE_KEY } from "../mocks";

describe("Options", () => {
	const signer = new Wallet(PRIVATE_KEY, new JsonRpcProvider());
	const network = TheaNetwork.GANACHE;
	let auth: Auth;

	beforeEach(() => {
		auth = new Auth(signer, network);
	});

	describe("login", () => {
		it("should authenticate user correctly", async () => {
			jest.spyOn(auth.httpClient, "post").mockImplementation(async (url) => {
				if (url === "/requestSignLogin") {
					return mockLoginRequest;
				} else {
					return mockClient;
				}
			});
			const result = await auth.login();
			expect(result).toEqual(mockClient);
		});

		it("should throw error that typed data signer is required", async () => {
			auth = new Auth(new JsonRpcProvider(), network);
			await expect(auth.login()).rejects.toThrow(
				new TheaError({
					type: "TYPED_DATA_SIGNER_REQUIRED",
					message:
						"TypedDataSigner is required for this operation. You must pass in a TypedDataSigner(Wallet) on SDK initialization"
				})
			);
		});
	});

	describe("logout", () => {
		it("should logout user correctly", async () => {
			const httpClient = jest.spyOn(auth.httpClient, "post").mockResolvedValue({ result: "OK" });
			const result = await auth.logout();
			expect(result).toEqual({ result: "OK" });
			expect(httpClient).toBeCalledWith("/logout", null);
		});
	});
});
