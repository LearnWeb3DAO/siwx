import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "@learnweb3dao/siwx-common";
import { ec, hash } from "starknet";

export class SiwStarknetMessage extends SiwxMessage<string> {
  toMessage(): string {
    const messageStr = this._toMessage("Starknet");
    return messageStr;
  }

  async verify(params: VerifyParams): Promise<VerificationResponse<string>> {
    try {
      const { signature } = params;

      this._verify(params);

      const message = this.toMessage();
      const bytes = Buffer.from(new TextEncoder().encode(message)).toString(
        "hex"
      );
      const messageHash = hash.computeHashOnElements([bytes]);

      const verifyResult = ec.starkCurve.verify(
        signature,
        messageHash,
        this.address
      );
      if (!verifyResult) {
        throw new SiwxError(
          SiwxErrorTypes.INVALID_SIGNATURE,
          `Signature does not match public key ${this.address}`
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
