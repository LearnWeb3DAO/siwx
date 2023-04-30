import { randomStringForEntropy } from "@stablelib/random";

const ISO8601 =
  /^(?<date>[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;

export function isValidISO8601Date(date: string): boolean {
  const inputMatch = ISO8601.exec(date);
  if (!inputMatch) return false;

  const parsedDate = new Date(inputMatch.groups.date).toISOString();
  const parsedDateMatch = ISO8601.exec(parsedDate);

  return inputMatch.groups.date === parsedDateMatch.groups.date;
}

export function generateNonce() {
  const nonce = randomStringForEntropy(96);
  return nonce;
}
