import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "common";
import { ed25519 } from "@noble/curves/ed25519";
import { fromString as u8aFromString } from "uint8arrays/from-string";

export class SiwsMessage extends SiwxMessage<Uint8Array> {
  toMessage(): Uint8Array {
    const messageStr = this._toMessage("Solana");

    return new TextEncoder().encode(messageStr);
  }

  async verify(
    params: VerifyParams
  ): Promise<VerificationResponse<Uint8Array>> {
    try {
      const { signature } = params;

      this._verify(params);

      const message = this.toMessage();
      const signatureU8 = u8aFromString(signature, "base58btc");
      const publicKeyU8 = u8aFromString(this.address, "base58btc");

      const verifyResult = ed25519.verify(signatureU8, message, publicKeyU8);
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
