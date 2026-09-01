import "dotenv/config";

import {
  CloudReleaseConfigurationError,
  validateCloudReleaseConfiguration,
} from "./cloud-release-configuration";

try {
  const summary = validateCloudReleaseConfiguration();
  console.log("Cloud release target is valid.");
  console.log(JSON.stringify(summary, null, 2));
} catch (error: unknown) {
  const message = error instanceof CloudReleaseConfigurationError
    ? error.message
    : "Cloud release configuration could not be validated.";
  console.error(message);
  process.exitCode = 1;
}
