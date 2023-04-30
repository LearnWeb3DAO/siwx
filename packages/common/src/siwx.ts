import {
  SiwxError,
  SiwxErrorTypes,
  VerificationResponse,
  VerifyParams,
} from "./types";
import * as validUrl from "valid-url";
import { generateNonce, isValidISO8601Date } from "./utils";

export enum SignatureType {
  PERSONAL_SIGNATURE = "Personal signature",
}

export abstract class SiwxMessage<TMessageType> {
  domain: string;
  address: string;
  statement?: string = undefined;
  uri: string;
  version: string;
  nonce?: string = undefined;
  issuedAt?: string = undefined;
  expirationTime?: string = undefined;
  notBefore?: string = undefined;
  requestId?: string = undefined;
  chainId: string;
  resources?: string[] = undefined;
  signature?: string = undefined;
  type?: SignatureType = undefined;

  constructor(opts: Partial<SiwxMessage<TMessageType>>) {
    Object.assign(this, opts);

    this.nonce = this.nonce || generateNonce();
    this.validateMessage();
  }

  abstract toMessage(): TMessageType;
  abstract verify(
    params: VerifyParams
  ): Promise<VerificationResponse<TMessageType>>;

  protected _toMessage(chainName: string) {
    this.validateMessage();

    const header = `${this.domain} wants you to sign in with your ${chainName} account:`;
    const uriField = `URI: ${this.uri}`;
    let prefix = [header, this.address].join("\n");
    const versionField = `Version: ${this.version}`;

    if (!this.nonce) {
      this.nonce = generateNonce();
    }

    const nonceField = `Nonce: ${this.nonce}`;
    const chainIdField = `Chain ID: ${this.chainId}`;

    const suffixArray = [uriField, versionField, nonceField, chainIdField];

    this.issuedAt = this.issuedAt ?? new Date().toISOString();
    suffixArray.push(`Issued At: ${this.issuedAt}`);

    if (this.expirationTime) {
      suffixArray.push(`Expiration Time: ${this.expirationTime}`);
    }

    if (this.notBefore) {
      suffixArray.push(`Not Before: ${this.notBefore}`);
    }

    if (this.requestId) {
      suffixArray.push(`Request ID: ${this.requestId}`);
    }

    if (this.resources) {
      suffixArray.push(
        [`Resources:`, ...this.resources.map((x) => `- ${x}`)].join("\n")
      );
    }

    const suffix = suffixArray.join("\n");
    prefix = [prefix, this.statement].join("\n\n");
    if (this.statement) {
      prefix += "\n";
    }
    return [prefix, suffix].join("\n");
  }

  protected _verify(params: VerifyParams) {
    const { domain, nonce, time } = params;

    if (domain && domain !== this.domain) {
      throw new SiwxError(
        SiwxErrorTypes.DOMAIN_MISMATCH,
        `${domain} does not match ${this.domain}`
      );
    }

    if (nonce && nonce !== this.nonce) {
      throw new SiwxError(
        SiwxErrorTypes.NONCE_MISMATCH,
        `${nonce} does not match ${this.nonce}`
      );
    }

    const checkTime = new Date(time ?? new Date());

    if (this.expirationTime) {
      const expirationDate = new Date(this.expirationTime);

      if (checkTime.getTime() >= expirationDate.getTime()) {
        throw new SiwxError(
          SiwxErrorTypes.EXPIRED_MESSAGE,
          `Message expired at ${expirationDate.toISOString()}`
        );
      }
    }

    if (this.notBefore) {
      const notBeforeDate = new Date(this.notBefore);

      if (checkTime.getTime() < notBeforeDate.getTime()) {
        throw new SiwxError(
          SiwxErrorTypes.NOT_YET_VALID_MESSAGE,
          `Message cannot be used before ${notBeforeDate.toISOString()}`
        );
      }
    }
  }

  private validateMessage() {
    if (
      !this.domain ||
      this.domain.length === 0 ||
      !/[^#?]*/.test(this.domain)
    ) {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_DOMAIN,
        `${this.domain} is not a valid domain.`
      );
    }

    if (!validUrl.isUri(this.uri)) {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_URI,
        `${this.uri} is not a valid URI.`
      );
    }

    if (this.version !== "1") {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_MESSAGE_VERSION,
        `${this.version} is not a valid message version.`
      );
    }

    if (!this.nonce || this.nonce.length < 8) {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_NONCE,
        `${this.nonce} is not a valid nonce.`
      );
    }

    if (this.issuedAt && !isValidISO8601Date(this.issuedAt)) {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_TIME_FORMAT,
        `${this.issuedAt} is not a valid ISO8601 date.`
      );
    }

    if (this.expirationTime && !isValidISO8601Date(this.expirationTime)) {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_TIME_FORMAT,
        `${this.expirationTime} is not a valid ISO8601 date.`
      );
    }

    if (this.notBefore && !isValidISO8601Date(this.notBefore)) {
      throw new SiwxError(
        SiwxErrorTypes.INVALID_TIME_FORMAT,
        `${this.notBefore} is not a valid ISO8601 date.`
      );
    }
  }
}
