import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "@learnweb3dao/siwx-common";
import base58 from "bs58";
import { getPkhfromPk, verifySignature } from "@taquito/utils";

// ED
const Base58CheckSumLength = 4;

export function encodePayload(message: string): string {
  const michelinePrefix = "05";
  const stringPrefix = "01";
  const len = ("0000000" + message.length.toString(16)).slice(-8);

  const hexText = Buffer.from(message).toString("hex");

  return michelinePrefix + stringPrefix + len + hexText;
}

export class SiwTezosMessage extends SiwxMessage<string> {
  toMessage(): string {
    const messageStr = this._toMessage("Tezos");

    // Reference from https://github.com/ceramicnetwork/js-did/blob/main/packages/cacao/src/siwx/siwTezos.ts
    return encodePayload(messageStr);
  }

  async verify(params: VerifyParams): Promise<VerificationResponse<string>> {
    try {
      const { signature } = params;

      this._verify(params);

      const message = this.toMessage();

      // We append the public key to the end of the signature as there is no way to go from Pkh -> Pk
      const publicKey = signature.slice(99);
      const realSignature = signature.slice(0, 99);

      if (this.address !== getPkhfromPk(publicKey)) {
        throw new SiwxError(
          SiwxErrorTypes.ADDRESS_MISMATCH,
          `Public Key does not match address ${this.address}`
        );
      }

      const verifyResult = verifySignature(message, publicKey, realSignature);
      if (!verifyResult) {
        throw new SiwxError(
          SiwxErrorTypes.INVALID_SIGNATURE,
          `Signature does not match address ${this.address}`
        );
      }

      return {
        success: true,
        data: this,
      };
    } catch (error) {
      return {
        success: false,
        error,
        data: this,
      };
    }
  }
}
