# Unitern production infrastructure

This Terraform root owns Google Cloud APIs, Artifact Registry, workload
identities, Secret Manager containers, Cloud Run, the public invoker policy, an
uptime check, and a cost budget. Neon and Cloudflare R2 stay outside this state;
their credentials enter Cloud Run through Secret Manager.

## Why deployment starts disabled

Cloud Run validates referenced secret versions while creating a revision. The
first Terraform apply therefore creates the registry, identities, and empty
secret containers while `deploy_application = false`.

This produces a safe bootstrap sequence:

1. Initialize Terraform against the remote state bucket.
2. Apply with application deployment disabled.
3. Add one current version to every secret listed by `terraform output secret_ids`.
4. Build and push an image tagged with the Git commit SHA.
5. Set `container_image` to that immutable image and enable deployment.
6. Apply again, then run the production smoke checks.

## Initialize the remote backend

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="prefix=unitern/production"
terraform plan -out production.tfplan
terraform apply production.tfplan
```

The backend arguments describe where Terraform state lives; they are not normal
input variables. State is versioned in the private bucket created by the
bootstrap root.

## Secret handling

Terraform intentionally creates secret containers without secret versions. Do
not put secret values in `terraform.tfvars`, shell history, GitHub variables, or
Terraform resources. Add them with the Google Cloud console or a protected
one-time command, then let Cloud Run reference `latest`.

Required values are:

- pooled Neon `DATABASE_URL`;
- direct Neon `DIRECT_DATABASE_URL`;
- a random `AUTH_SECRET` of at least 32 characters;
- Resend API key;
- server-side MapTiler key;
- R2 access-key ID and secret access key;
- optional Mapbox token when road routing is enabled.

The runtime identity can read all application secrets. The protected deployment
identity can read only the pooled and direct database URLs, because its release
responsibility is limited to validating and applying migrations before
promoting a revision.

## Ownership boundary

Terraform owns service configuration, IAM, scaling, probes, and secrets. The
release workflow owns only the container image promoted into the service. The
Terraform lifecycle rule ignores image changes so a successful deployment does
not appear as infrastructure drift on the next plan.

## GitHub deployment variables

After the first infrastructure apply, configure these non-secret repository
variables:

```text
GCP_PROJECT_ID
GCP_REGION
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_DEPLOY_SERVICE_ACCOUNT
CLOUD_RUN_SERVICE
NEXT_PUBLIC_MAPTILER_KEY
NEXT_PUBLIC_MAP_STYLE_URL
```

Use the matching Terraform outputs for the provider and service-account values.
The public MapTiler browser key must be restricted to the production origin.
None of these values are private credentials; Google Cloud authorization comes
from the short-lived GitHub OIDC token. The workflow still targets GitHub's
`production` environment so you can add a deployment approval rule separately.
