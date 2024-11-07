/**
 * @jest-environment node
 */
import {
  submitPaybotTransaction,
  AuthInfo,
  TransactionInput,
} from "../src/index";

describe("test paybot transactions", () => {
  test("basic", async () => {
    jest.setTimeout(100000);
    const auth = new AuthInfo("XXXX", "XXXX", "0xXXXX");
    const input = new TransactionInput(
      "0x3cb81a320ab9ca5824c2118d5cd48b7425fe7997",
      "https://app.paycaster.co/api/frames/multi/b9fc47d8-0be0-41d2-81ec-d4aa2c154561",
      auth,
    );
    expect(await submitPaybotTransaction(input)).toBe("hello world"); // this is expected to fail
  });
});
