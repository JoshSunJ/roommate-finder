import "dotenv/config";

import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { Pool } from "pg";

import {
  E2E_EMAIL,
  E2E_MARKETPLACE_HELPER_EMAIL,
  E2E_MARKETPLACE_OWNER_EMAIL,
  E2E_MARKETPLACE_PASSWORD,
} from "./test-account";

const testEmails = [
  E2E_EMAIL,
  E2E_MARKETPLACE_OWNER_EMAIL,
  E2E_MARKETPLACE_HELPER_EMAIL,
];

function key(scope: string, identifier: string) {
  const digest = createHash("sha256")
    .update(identifier.trim().toLowerCase())
    .digest("hex");
  return `${scope}:${digest}`;
}

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E setup.");
  return new Pool({ connectionString, max: 1 });
}

export async function cleanE2EAccount() {
  const pool = database();
  try {
    await pool.query(
      `DELETE FROM "Listing"
       WHERE "ownerId" IN (SELECT "id" FROM "User" WHERE "email" = ANY($1::text[]))`,
      [testEmails],
    );
    await pool.query(
      `DELETE FROM "HousingRequest"
       WHERE "ownerId" IN (SELECT "id" FROM "User" WHERE "email" = ANY($1::text[]))`,
      [testEmails],
    );
    await pool.query(`DELETE FROM "User" WHERE "email" = ANY($1::text[])`, [testEmails]);
    const rateLimitKeys = testEmails.flatMap((email) => [
      key("register-email", email),
      key("password-reset-address", email),
      key("sign-in-address", email),
    ]);
    await pool.query(
      `DELETE FROM "RateLimitBucket" WHERE "key" = ANY($1::text[])`,
      [rateLimitKeys],
    );
  } finally {
    await pool.end();
  }
}

export async function createMarketplaceE2EAccounts() {
  const pool = database();
  const passwordHash = await hash(E2E_MARKETPLACE_PASSWORD, 4);
  try {
    await pool.query(
      `INSERT INTO "User" (
         "name", "email", "emailVerifiedAt", "passwordHash",
         "affiliationType", "affiliationName", "verificationStatus"
       ) VALUES
         ('Marketplace Owner', $1, NOW(), $3, 'intern', 'Unitern E2E', 'verified'),
         ('Helpful Student', $2, NOW(), $3, 'student', 'Unitern E2E', 'verified')`,
      [E2E_MARKETPLACE_OWNER_EMAIL, E2E_MARKETPLACE_HELPER_EMAIL, passwordHash],
    );
  } finally {
    await pool.end();
  }
}

export async function markE2EAccountAffiliationVerified() {
  const pool = database();
  try {
    const result = await pool.query(
      `UPDATE "User" SET "verificationStatus" = 'verified' WHERE "email" = $1`,
      [E2E_EMAIL],
    );
    if (result.rowCount !== 1) throw new Error("The E2E account was not found.");
  } finally {
    await pool.end();
  }
}
