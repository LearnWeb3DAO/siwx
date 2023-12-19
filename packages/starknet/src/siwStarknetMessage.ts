import {
  SiwxError,
  SiwxErrorTypes,
  SiwxMessage,
  VerificationResponse,
  VerifyParams,
} from "@learnweb3dao/siwx-common";
import {
  Contract,
  Provider,
  TypedData,
  constants,
  hash,
  shortString,
  typedData,
} from "starknet";

export interface StarknetVerifyParams extends VerifyParams {
  pubKey: string;
}

export class SiwStarknetMessage extends SiwxMessage<TypedData> {
  toMessage(): TypedData {
    const messageStr = this._toMessage("Starknet");
    const messageHash = hash
      .starknetKeccak(messageStr)
      .toString(16)
      .substring(0, 31);

    const typedData: TypedData = {
      types: {
        StarkNetDomain: [
          { name: "name", type: "string" },
          { name: "version", type: "felt" },
          { name: "chainId", type: "felt" },
        ],
        Message: [{ name: "hash", type: "felt" }],
      },

      primaryType: "Message",
      domain: {
        name: shortString.encodeShortString(this.domain.substring(0, 31)),
        version: "1",
        chainId: shortString.encodeShortString(
          this.chainId.endsWith("SN_MAIN") ? "SN_MAIN" : "SN_GOERLI"
        ),
      },
      message: {
        hash: messageHash,
      },
    };

    return typedData;
  }

  async verify(
    params: StarknetVerifyParams
  ): Promise<VerificationResponse<TypedData>> {
    try {
      const { signature, pubKey } = params;

      this._verify(params);

      const [r, s] = signature.split(",");
      const msgHash = typedData.getMessageHash(this.toMessage(), this.address);

      const provider = new Provider({
        sequencer: { network: constants.NetworkName.SN_GOERLI },
      });

      const { abi } = await provider.getClassAt(this.address);
      const contractAccount = new Contract(abi, this.address, provider);

      try {
        await contractAccount.isValidSignature(msgHash, [r, s]);
      } catch {
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

/*
{
      randomPvtKey: Uint8Array(32) [
          2, 180, 139, 196,  80, 219, 192,  48,
        190,  16, 248, 177,  58, 187, 165, 211,
         28,  12,  83, 180, 187,  18,  68,  28,
        245,  76, 170, 204,  61,  48,  33, 180
      ],
      randomPvtKeyHex: '02b48bc450dbc030be10f8b13abba5d31c0c53b4bb12441cf54caacc3d3021b4',
      pubKey: Uint8Array(65) [
          4,   5,  67, 103, 206,  58, 178, 217,  58, 115, 158,
        172,  10, 246, 251, 107, 247, 102,  57,  25, 207,  23,
          1, 112,  89,  57, 135, 223, 190,  86, 167, 223, 163,
          3, 117, 212,  60,   6, 172, 220,  41, 179, 172,  19,
         15,  70, 129, 102, 188, 140,  16,  50, 122, 236, 165,
        179, 239,  77, 150, 141, 118, 135, 129, 184,  84
      ],
      pubKeyHex: '04054367ce3ab2d93a739eac0af6fb6bf7663919cf170170593987dfbe56a7dfa30375d43c06acdc29b3ac130f468166bc8c10327aeca5b3ef4d968d768781b854'
    }
*/
