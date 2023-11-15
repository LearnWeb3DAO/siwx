import { ec } from "starknet";

describe("Sign in with Starknet", () => {
  test("placeholder", async () => {
    const randomPvtKey = ec.starkCurve.utils.randomPrivateKey();
    const randomPvtKeyHex = Buffer.from(randomPvtKey).toString("hex");
    const pubKey = ec.starkCurve.getPublicKey(randomPvtKeyHex);
    const pubKeyHex = Buffer.from(pubKey).toString("hex");

    console.log({ randomPvtKey, randomPvtKeyHex, pubKey, pubKeyHex });
  });
});
