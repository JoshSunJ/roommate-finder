import "dotenv/config";

import { createHash } from "node:crypto";
import { Pool } from "pg";

import { E2E_EMAIL } from "./test-account";

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
       WHERE "ownerId" IN (SELECT "id" FROM "User" WHERE "email" = $1)`,
      [E2E_EMAIL],
    );
    await pool.query(`DELETE FROM "User" WHERE "email" = $1`, [E2E_EMAIL]);
    await pool.query(
      `DELETE FROM "RateLimitBucket" WHERE "key" = ANY($1::text[])`,
      [[
        key("register-email", E2E_EMAIL),
        key("password-reset-address", E2E_EMAIL),
        key("sign-in-address", E2E_EMAIL),
      ]],
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
