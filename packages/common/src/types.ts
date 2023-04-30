import { SiwxMessage } from "./siwx";

export interface VerifyParams {
  signature: string;
  domain?: string;
  nonce?: string;
  time?: string;
}

export interface VerificationResponse<TMessageType> {
  success: boolean;
  error?: SiwxError;
  data: SiwxMessage<TMessageType>;
}

export enum SiwxErrorTypes {
  INVALID_SIGNATURE = "Invalid signature.",
  NOT_YET_VALID_MESSAGE = "Message cannot be used before notBefore time.",
  EXPIRED_MESSAGE = "Expired message.",
  MALFORMED_SESSION = "Malformed session.",
  INVALID_DOMAIN = "Invalid domain.",
  DOMAIN_MISMATCH = "Domain does not match provided domain for verification.",
  INVALID_ADDRESS = "Invalid address.",
  INVALID_URI = "Invalid URI.",
  INVALID_NONCE = "Invalid nonce.",
  NONCE_MISMATCH = "Nonce does not match provided nonce for verification.",
  INVALID_TIME_FORMAT = "Invalid time format.",
  INVALID_MESSAGE_VERSION = "Invalid message version.",
}

export class SiwxError extends Error {
  type: SiwxErrorTypes;

  constructor(type: SiwxErrorTypes, message?: string) {
    super(message);
    this.type = type;
  }
}
