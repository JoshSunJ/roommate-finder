import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../../.github/workflows/release-cloud-run.yml", import.meta.url),
  "utf8",
);

function position(stepName: string): number {
  const index = workflow.indexOf(`- name: ${stepName}`);
  assert.notEqual(index, -1, `release workflow is missing: ${stepName}`);
  return index;
}

test("release preflight runs before cloud access and database tooling", () => {
  assert.match(workflow, /run: npm ci --ignore-scripts/);

  const install = position(
    "Install locked release tooling without application lifecycle scripts",
  );
  const validateTarget = position("Validate the release target");
  const authenticate = position("Authenticate with short-lived Google credentials");
  const loadDatabase = position("Load migration-only database credentials");
  const generateClient = position(
    "Generate the database client after credentials are available",
  );
  const validateDatabase = position("Reject an unsafe database target");
  const migrate = position("Apply reviewed database migrations once");

  assert.ok(install < validateTarget);
  assert.ok(validateTarget < authenticate);
  assert.ok(authenticate < loadDatabase);
  assert.ok(loadDatabase < generateClient);
  assert.ok(generateClient < validateDatabase);
  assert.ok(validateDatabase < migrate);
});
