export type CloudReleaseEnvironment = "staging" | "production";

type Environment = Record<string, string | undefined>;

export type CloudReleaseSummary = {
  environment: CloudReleaseEnvironment;
  gitRef: string;
  projectId: string;
  region: string;
  service: string;
  mapStyleConfigured: boolean;
};

export class CloudReleaseConfigurationError extends Error {
  constructor(problems: string[]) {
    super(`Cloud release configuration is invalid:\n- ${problems.join("\n- ")}`);
    this.name = "CloudReleaseConfigurationError";
  }
}

const placeholderPattern = /(^|[-_.])(change|example|placeholder|replace|todo|your)([-_.]|$)/i;

function required(environment: Environment, name: string, problems: string[]): string {
  const value = environment[name]?.trim() ?? "";

  if (!value) {
    problems.push(`${name} is required in the selected GitHub environment.`);
  } else if (placeholderPattern.test(value)) {
    problems.push(`${name} still contains a placeholder value.`);
  }

  return value;
}

export function validateCloudReleaseConfiguration(
  environment: Environment = process.env,
): CloudReleaseSummary {
  const problems: string[] = [];
  const deploymentEnvironment = required(
    environment,
    "DEPLOYMENT_ENVIRONMENT",
    problems,
  );
  const gitRef = required(environment, "GITHUB_REF", problems);
  const projectId = required(environment, "GCP_PROJECT_ID", problems);
  const region = required(environment, "GCP_REGION", problems);
  const identityProvider = required(
    environment,
    "GCP_WORKLOAD_IDENTITY_PROVIDER",
    problems,
  );
  const deploymentServiceAccount = required(
    environment,
    "GCP_DEPLOY_SERVICE_ACCOUNT",
    problems,
  );
  const service = required(environment, "CLOUD_RUN_SERVICE", problems);
  required(environment, "NEXT_PUBLIC_MAPTILER_KEY", problems);

  if (deploymentEnvironment !== "staging" && deploymentEnvironment !== "production") {
    problems.push("DEPLOYMENT_ENVIRONMENT must be staging or production.");
  }

  if (gitRef && gitRef !== "refs/heads/master") {
    problems.push("Cloud releases must run from refs/heads/master after CI and review.");
  }

  if (projectId && !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
    problems.push("GCP_PROJECT_ID is not a valid Google Cloud project ID.");
  }

  if (region && !/^[a-z]+-[a-z0-9]+[0-9]$/.test(region)) {
    problems.push("GCP_REGION must look like us-west1.");
  }

  if (
    identityProvider &&
    !/^projects\/\d+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/.test(
      identityProvider,
    )
  ) {
    problems.push(
      "GCP_WORKLOAD_IDENTITY_PROVIDER must be the full provider resource name from Terraform.",
    );
  }

  if (
    deploymentServiceAccount &&
    !/^[a-z][a-z0-9-]+@[a-z][a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(
      deploymentServiceAccount,
    )
  ) {
    problems.push("GCP_DEPLOY_SERVICE_ACCOUNT must be a Google service-account email.");
  }

  if (service && !/^[a-z][a-z0-9-]{0,61}[a-z0-9]$/.test(service)) {
    problems.push("CLOUD_RUN_SERVICE must be a lowercase Cloud Run service name.");
  }

  if (problems.length > 0) {
    throw new CloudReleaseConfigurationError(problems);
  }

  return {
    environment: deploymentEnvironment as CloudReleaseEnvironment,
    gitRef,
    projectId,
    region,
    service,
    mapStyleConfigured: Boolean(environment.NEXT_PUBLIC_MAP_STYLE_URL?.trim()),
  };
}
