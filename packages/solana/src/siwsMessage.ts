import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "@learnweb3dao/siwx-common";
import { ed25519 } from "@noble/curves/ed25519";
import base58 from "bs58";

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
      const signatureU8 = base58.decode(signature);
      const publicKeyU8 = base58.decode(this.address);

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
