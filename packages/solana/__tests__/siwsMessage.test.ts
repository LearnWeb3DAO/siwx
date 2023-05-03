import { ed25519 } from "@noble/curves/ed25519";
import { SiwxErrorTypes } from "common";
import { SiwsMessage } from "../src";
import base58 from "bs58";

const parsePositiveObjects = require("./fixtures/parse_positive.json");
const parseNegativeObjects = require("./fixtures/parse_negative.json");

describe("Sign in with Solana", () => {
  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Generates message successfully: %s",
    (_, test: any) => {
      const msg = new SiwsMessage(test.fields);
      expect(msg.toMessage()).toStrictEqual(
        new TextEncoder().encode(test.message)
      );
    }
  );

  test.concurrent.each(Object.entries(parseNegativeObjects))(
    "Throws error when generating message: %s",
    (_, test: any) => {
      try {
        new SiwsMessage(test);
      } catch (e) {
        expect(Object.values(SiwxErrorTypes).includes(e));
      }
    }
  );

  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Verifies message succcessfully with random wallet: %s",
    async (_, test: any) => {
      const randomPrivKey = ed25519.utils.randomPrivateKey();
      const randomPubKey = ed25519.getPublicKey(randomPrivKey);

      const msg = new SiwsMessage({
        ...test.fields,
        address: base58.encode(randomPubKey),
      });
      const msgU8 = msg.toMessage();

      const signatureU8 = ed25519.sign(msgU8, randomPrivKey);
      const signature = base58.encode(signatureU8);

      const result = await msg.verify({
        signature,
        time: test.fields.time || test.fields.issuedAt,
      });
      expect(result.error).toBe(undefined);
      expect(result.success).toBe(true);
    }
  );
});
