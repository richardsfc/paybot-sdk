/**
 * @jest-environment node
 */
import { submitPaybotTransaction } from "../src/index";

describe("test paybot transactions", () => {
  test("basic", async () => {
    expect(
      await submitPaybotTransaction(
        "https://app.paycaster.co/api/frames/2166a765-7c8d-4b1b-afb3-3ad237044033",
      ),
    ).toBe("1.23");
  });
});
