import { bytesToHex } from "@stacks/common";
import { SiwxErrorTypes } from "@learnweb3dao/siwx-common";
import { SiwStacksMessage } from "../src";
import {
  makeRandomPrivKey,
  getPublicKey,
  getAddressFromPublicKey,
  signMessageHashRsv,
  compressPublicKey,
} from "@stacks/transactions";
import { hashMessage } from "@stacks/encryption";

const parsePositiveObjects = require("./fixtures/parse_positive.json");
const parseNegativeObjects = require("./fixtures/parse_negative.json");

describe("Sign in with Stacks", () => {
  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Generates message successfully: %s",
    (_, test: any) => {
      const msg = new SiwStacksMessage(test.fields);
      expect(msg.toMessage()).toBe(test.message);
    }
  );

  test.concurrent.each(Object.entries(parseNegativeObjects))(
    "Throws error when generating message: %s",
    (_, test: any) => {
      try {
        new SiwStacksMessage(test);
      } catch (e) {
        expect(Object.values(SiwxErrorTypes).includes(e));
      }
    }
  );

  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Verifies message succcessfully with random wallet: %s",
    async (_, test: any) => {
      const randomSecretKey = makeRandomPrivKey();
      const randomPubKey = getPublicKey(randomSecretKey);
      const compressedPubKey = compressPublicKey(randomPubKey.data);
      const randomAddress = getAddressFromPublicKey(compressedPubKey.data);

      const msg = new SiwStacksMessage({
        ...test.fields,
        address: randomAddress,
      });

      const messageStr = msg.toMessage();
      const messageHash = bytesToHex(hashMessage(messageStr));

      const signature = signMessageHashRsv({
        messageHash,
        privateKey: randomSecretKey,
      });

      const result = await msg.verify({
        signature: signature.data,
        time: test.fields.time || test.fields.issuedAt,
      });

      expect(result.error).toBe(undefined);
      expect(result.success).toBe(true);
    }
  );
});
