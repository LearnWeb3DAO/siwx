import { SiwxErrorTypes } from "@learnweb3dao/siwx-common";
import {
  Account,
  CallData,
  RpcProvider,
  WeierstrassSignatureType,
  ec,
  hash,
} from "starknet";
import { SiwStarknetMessage } from "../src";

const parsePositiveObjects = require("./fixtures/parse_positive.json");
const parseNegativeObjects = require("./fixtures/parse_negative.json");

describe("Sign in with Starknet", () => {
  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Generates message successfully: %s",
    (_, test: any) => {
      const msg = new SiwStarknetMessage(test.fields);

      expect(msg.toMessage()).toStrictEqual(test.message);
    }
  );

  test.concurrent.each(Object.entries(parseNegativeObjects))(
    "Throws error when generating message: %s",
    (_, test: any) => {
      try {
        new SiwStarknetMessage(test);
      } catch (e) {
        expect(Object.values(SiwxErrorTypes).includes(e));
      }
    }
  );

  test.concurrent.each(Object.entries(parsePositiveObjects))(
    "Verifies message succcessfully with random wallet: %s",
    async (_, test: any) => {
      const provider = new RpcProvider({
        nodeUrl: "https://starknet-testnet.public.blastapi.io",
      });

      // new Open Zeppelin account v0.5.1
      // Generate public and private key pair.
      const privateKey =
        "0x5eb9312860cea8749bde73dd3ac34873b937a1102f6f155715812a31bd5dc14";
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

      const OZaccountClassHash =
        "0x2794ce20e5f2ff0d40e632cb53845b9f4e526ebd8471983f7dbd355b721d5a";
      // Calculate future address of the account
      const OZaccountConstructorCallData = CallData.compile({
        publicKey: starkKeyPub,
      });
      const OZcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPub,
        OZaccountClassHash,
        OZaccountConstructorCallData,
        0
      );

      const OZaccount = new Account(provider, OZcontractAddress, privateKey);

      // Deploy account
      // const { transaction_hash, contract_address } =
      //   await OZaccount.deployAccount({
      //     classHash: OZaccountClassHash,
      //     constructorCalldata: OZaccountConstructorCallData,
      //     addressSalt: starkKeyPub,
      //   });

      // await provider.waitForTransaction(transaction_hash);
      // console.log({ transaction_hash });

      const msg = new SiwStarknetMessage({
        ...test.fields,
        address: OZcontractAddress,
      });

      const typedData = msg.toMessage();

      const signature = (await OZaccount.signMessage(
        typedData
      )) as WeierstrassSignatureType;

      const result = await msg.verify({
        signature: `${signature.r},${signature.s}`,
        time: test.fields.time || test.fields.issuedAt,
      });

      expect(result.error).toBe(undefined);
      expect(result.success).toBe(true);
    }
  );
});
