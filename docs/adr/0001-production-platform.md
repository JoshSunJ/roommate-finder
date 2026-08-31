# ADR 0001: Production platform and deployment boundaries

- Status: Accepted
- Date: 2026-08-29
- Owners: Unitern engineering

## Context

Unitern is a Next.js application with a PostgreSQL database, transactional
email, S3-compatible photo storage, and third-party map services. The project
needs an inexpensive first production environment, but it is also a portfolio
project intended to demonstrate production engineering practices.

The application already builds as a portable, non-root Docker image. Production
database migrations are separate from application startup, and runtime
configuration is validated before the server accepts traffic.

We considered three hosting approaches:

1. Railway, which minimizes operational setup and time to first deployment.
2. AWS ECS/Fargate with RDS and an Application Load Balancer, which exposes many
   enterprise infrastructure concepts but creates more cost and operational
   surface than the current traffic justifies.
3. Google Cloud Run with managed external data services, which keeps the
   container and IAM model explicit while supporting scale-to-zero.

## Decision

Deploy the Unitern web container to Google Cloud Run in `us-west1` and manage
Google Cloud resources with Terraform.

The production boundaries are:

| Responsibility | Service | Reason |
| --- | --- | --- |
| Web runtime | Google Cloud Run | Managed HTTPS, immutable revisions, horizontal scaling, and scale-to-zero |
| Container registry | Google Artifact Registry | Private, regional image storage close to the runtime |
| Runtime secrets | Google Secret Manager | Versioned secrets mounted as environment variables without committing values |
| Runtime identity | Dedicated Cloud Run service account | Least-privilege access and no embedded cloud credentials |
| Deployment identity | GitHub Actions through Workload Identity Federation | Short-lived OIDC credentials instead of service-account keys |
| Relational data | Neon PostgreSQL | Managed PostgreSQL with pooled runtime and direct migration connections |
| Listing photos | Cloudflare R2 | Existing S3-compatible adapter and low-cost object storage |
| Transactional email | Resend | Existing server-side email adapter |
| Maps and search | MapTiler | Existing provider integration and browser-key restrictions |
| Verification | GitHub Actions and production smoke tests | Automated evidence before and after deployment |

The web process remains stateless. Durable records belong in PostgreSQL and
durable files belong in R2, so any Cloud Run instance can handle any request.

## Release model

Each isolated environment builds an immutable image for a commit and identifies
it by the same Git SHA:

```text
pull request -> CI checks -> merge to master -> staging migration/deployment/smoke
             -> manual production approval -> production migration/deployment/smoke
```

Database migrations run once from the trusted release workflow before the new
revision receives traffic. They do not run in the web container startup command,
because multiple instances can start concurrently.

Production deployments use a protected GitHub environment. The environment may
require manual approval even after CI passes. A green CI run makes a revision
eligible for deployment; it does not approve product changes or automatically
merge a pull request.

Staging uses the same Terraform declarations and release workflow in a separate
Google Cloud project, database, storage bucket, GitHub environment, and state
prefix. It deploys automatically after relevant changes reach `master`.

## Secret and state rules

- Terraform creates Secret Manager containers and IAM bindings, but it never
  stores application secret values in source control or Terraform variables.
- Secret values are added outside Terraform and referenced by version.
- Terraform state must use a remote, access-controlled backend before more than
  one engineer manages production. Local state is acceptable only during the
  initial no-resource planning exercise and must never be committed.
- GitHub authenticates to Google Cloud with OIDC. Long-lived JSON service-account
  keys are not permitted.
- Public `NEXT_PUBLIC_*` values are treated as browser-visible build
  configuration, not secrets.

## Cost and scaling controls

- Cloud Run starts with zero minimum instances and a maximum of two instances.
- CPU, memory, concurrency, and request timeout are bounded in Terraform.
- Google Cloud billing budgets and alerts are required before production traffic.
- Artifact Registry uses a cleanup policy to limit old image accumulation.
- Neon and R2 begin on low-cost plans and can be replaced behind the existing
  database and S3-compatible boundaries if requirements change.

The instance ceiling is a safety limit, not a permanent capacity decision. It
must be revisited using latency, error-rate, database-connection, and traffic
measurements.

## Consequences

### Benefits

- The project demonstrates Docker, IAM, infrastructure as code, secret
  management, CI/CD, migrations, health checks, observability, and rollback.
- Scale-to-zero keeps an idle portfolio environment inexpensive.
- The container and PostgreSQL/S3 boundaries reduce provider lock-in.
- GitHub never stores a permanent Google Cloud credential.

### Trade-offs

- The system spans multiple providers, creating network and operational
  dependencies.
- Cloud Run and Neon must be placed in nearby US regions and use connection
  pooling to control database latency and connection counts.
- Terraform and IAM add initial complexity compared with Railway.
- Free tiers and provider pricing can change; alerts and periodic cost review are
  still necessary.

## Deferred decisions

- A custom domain and DNS provider.
- A production error-tracking provider.
- Moving PostgreSQL to Cloud SQL if cross-provider latency, compliance, or
  networking requirements justify the additional fixed cost.
- A separate worker service or queue when background workloads become real.
- An AWS reference deployment; the architecture concepts remain transferable.
