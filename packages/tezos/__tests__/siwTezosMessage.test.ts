import { SiwxErrorTypes } from "@learnweb3dao/siwx-common";
import { SiwTezosMessage, encodePayload } from "../src";
import { InMemorySigner } from "@taquito/signer";

const parsePositiveObjects = require("./fixtures/parse_positive.json");
const parseNegativeObjects = require("./fixtures/parse_negative.json");

describe("Sign in with Tezos", () => {
  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Generates message successfully: %s",
    (_, test: any) => {
      const msg = new SiwTezosMessage(test.fields);
      expect(msg.toMessage()).toStrictEqual(encodePayload(test.message));
    }
  );

  test.concurrent.each(Object.entries(parseNegativeObjects))(
    "Throws error when generating message: %s",
    (_, test: any) => {
      try {
        new SiwTezosMessage(test);
      } catch (e) {
        expect(Object.values(SiwxErrorTypes).includes(e));
      }
    }
  );

  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Verifies message succcessfully with random wallet: %s",
    async (_, test: any) => {
      const signer = new InMemorySigner(
        "edskS3DtVSbWbPD1yviMGebjYwWJtruMjDcfAZsH9uba22EzKeYhmQkkraFosFETmEMfFNVcDYQ5QbFerj9ozDKroXZ6mb5oxV"
      );
      const pubKey = await signer.publicKey();
      const address = await signer.publicKeyHash();

      const msg = new SiwTezosMessage({
        ...test.fields,
        address,
      });
      const msgStr = msg.toMessage();

      const signed = await signer.sign(msgStr);

      const result = await msg.verify({
        signature: signed.prefixSig + pubKey,
        time: test.fields.time || test.fields.issuedAt,
      });
      expect(result.error).toBe(undefined);
      expect(result.success).toBe(true);
    }
  );
});
