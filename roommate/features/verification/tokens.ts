import { createHash, randomBytes } from "node:crypto";

export const AFFILIATION_EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1_000;

export function createAffiliationVerificationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAffiliationVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function affiliationTokenExpiresAt(now = new Date()) {
  return new Date(now.getTime() + AFFILIATION_EMAIL_TOKEN_TTL_MS);
}
