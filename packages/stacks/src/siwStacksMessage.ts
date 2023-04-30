import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "common";
import { verifyMessageSignatureRsv, hashMessage } from "@stacks/encryption";
import {
  publicKeyFromSignatureRsv,
  createMessageSignature,
  getAddressFromPublicKey,
} from "@stacks/transactions";
import { bytesToHex } from "@stacks/common";

export class SiwStacksMessage extends SiwxMessage<string> {
  toMessage(): string {
    return this._toMessage("Stacks");
  }

  async verify(params: VerifyParams): Promise<VerificationResponse<string>> {
    try {
      const { signature } = params;

      this._verify(params);

      const message = this.toMessage();

      const recoveredPubKey = publicKeyFromSignatureRsv(
        bytesToHex(hashMessage(message)),
        createMessageSignature(signature)
      );

      const recoveredAddress = getAddressFromPublicKey(recoveredPubKey);

      if (recoveredAddress !== this.address) {
        throw new SiwxError(
          SiwxErrorTypes.ADDRESS_MISMATCH,
          `${recoveredAddress} does not match address ${this.address}`
        );
      }

      if (
        !verifyMessageSignatureRsv({
          message,
          publicKey: recoveredPubKey,
          signature: signature,
        })
      ) {
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
