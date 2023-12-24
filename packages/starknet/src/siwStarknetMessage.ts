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
  RpcProvider,
  TypedData,
  constants,
  hash,
  shortString,
  typedData,
} from "starknet";

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

  async verify(params: VerifyParams): Promise<VerificationResponse<TypedData>> {
    try {
      const { signature } = params;

      this._verify(params);

      const [r, s] = signature.split(",");
      const msgHash = typedData.getMessageHash(this.toMessage(), this.address);

      const provider = new RpcProvider({
        nodeUrl: this.chainId.endsWith("SN_MAIN")
          ? "https://starknet-mainnet.public.blastapi.io"
          : "https://starknet-testnet.public.blastapi.io",
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
