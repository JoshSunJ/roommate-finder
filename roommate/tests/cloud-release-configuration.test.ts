import assert from "node:assert/strict";
import test from "node:test";

import {
  CloudReleaseConfigurationError,
  validateCloudReleaseConfiguration,
} from "../scripts/cloud-release-configuration";

const validEnvironment = {
  DEPLOYMENT_ENVIRONMENT: "staging",
  GITHUB_REF: "refs/heads/master",
  GCP_PROJECT_ID: "unitern-staging-123",
  GCP_REGION: "us-west1",
  GCP_WORKLOAD_IDENTITY_PROVIDER:
    "projects/123456789/locations/global/workloadIdentityPools/unitern-github/providers/github",
  GCP_DEPLOY_SERVICE_ACCOUNT:
    "unitern-github-deploy@unitern-staging-123.iam.gserviceaccount.com",
  CLOUD_RUN_SERVICE: "unitern-staging-web",
  NEXT_PUBLIC_MAPTILER_KEY: "public-browser-key",
  NEXT_PUBLIC_MAP_STYLE_URL: "https://api.maptiler.com/maps/streets-v2/style.json",
};

test("a complete staging target returns only safe release metadata", () => {
  const summary = validateCloudReleaseConfiguration(validEnvironment);

  assert.deepEqual(summary, {
    environment: "staging",
    gitRef: "refs/heads/master",
    projectId: "unitern-staging-123",
    region: "us-west1",
    service: "unitern-staging-web",
    mapStyleConfigured: true,
  });
  assert.doesNotMatch(JSON.stringify(summary), /public-browser-key/);
});

test("a release from a feature branch is rejected", () => {
  assert.throws(
    () => validateCloudReleaseConfiguration({
      ...validEnvironment,
      GITHUB_REF: "refs/heads/feature/unreviewed-release",
    }),
    /must run from refs\/heads\/master/,
  );
});

test("missing and malformed GitHub environment variables fail together", () => {
  assert.throws(
    () => validateCloudReleaseConfiguration({
      ...validEnvironment,
      GCP_PROJECT_ID: "replace-me",
      GCP_REGION: "California",
      GCP_WORKLOAD_IDENTITY_PROVIDER: "github-provider",
      GCP_DEPLOY_SERVICE_ACCOUNT: "deploy@example.com",
      CLOUD_RUN_SERVICE: "Unitern staging",
      NEXT_PUBLIC_MAPTILER_KEY: "",
    }),
    (error: unknown) => {
      assert.ok(error instanceof CloudReleaseConfigurationError);
      assert.match(error.message, /GCP_PROJECT_ID still contains a placeholder/);
      assert.match(error.message, /GCP_REGION must look like us-west1/);
      assert.match(error.message, /full provider resource name/);
      assert.match(error.message, /service-account email/);
      assert.match(error.message, /lowercase Cloud Run service name/);
      assert.match(error.message, /NEXT_PUBLIC_MAPTILER_KEY is required/);
      return true;
    },
  );
});
