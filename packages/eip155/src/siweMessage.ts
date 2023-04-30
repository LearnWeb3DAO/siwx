import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "common";
import { utils } from "ethers";

export class SiweMessage extends SiwxMessage<string> {
  toMessage(): string {
    return this._toMessage("Ethereum");
  }

  async verify(params: VerifyParams): Promise<VerificationResponse<string>> {
    try {
      const { signature } = params;

      this._verify(params);

      const message = this.toMessage();
      const recoveredAddress = utils.verifyMessage(message, signature);

      if (recoveredAddress !== this.address) {
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
