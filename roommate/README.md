# Learning Memo

The key idea is that each step should leave you with a working application. Professional teams try to avoid building five unfinished systems at once. Build a small vertical slice
## page vs. layout files
Next.js uses folder-based routing. When you put a layout.tsx and a page.tsx in the same directory, Next.js automatically wraps the page inside the layout by passing the page content through the layout's children prop

## Structure(this is pasted from another deleted MD file)
browser
|
React Page
|
UserCard Component
|
API Request
|
API Route
|
Service Layer
|
Database

## Ideas and implementation plans:

user Destination input(type in preference)that doens't exist yet, add later.
Don’t add it yet. Keeping version one constrained to known destinations makes the next UI much easier to build and test.

## Local database

Listings are now stored in PostgreSQL rather than an in-memory array.

1. Start Docker Desktop.
2. Run `npm run db:up` to start the project database on port 5433.
3. Run `npm run db:migrate -- --name <descriptive_change>` after changing the Prisma schema.
4. Run `npm run db:seed` to reset the database to the three starter listings.
5. Run `npm run db:studio` to inspect the records in a browser.

The real connection string stays in `.env`, which Git ignores. `.env.example` documents the required local value.

## Production database release process

Unitern uses the same PostgreSQL schema in every environment, but it uses
different database instances and credentials:

```text
Local development  -> Docker PostgreSQL on localhost
CI                  -> Temporary PostgreSQL service for each workflow run
Production          -> Managed PostgreSQL with TLS and backups
```

Configure these server-only production variables in the deployment platform,
not in a committed file:

```text
DATABASE_URL         # application traffic; use a pooled URL when provided
DIRECT_DATABASE_URL  # migration traffic; use the provider's direct URL
```

Some providers support Prisma migrations over their pooled URL. In that case,
`DIRECT_DATABASE_URL` may be omitted and Prisma falls back to `DATABASE_URL`.

Before a production release:

1. Create an empty managed PostgreSQL database.
2. Require TLS in both connection URLs (`sslmode=require` or stricter).
3. Store the URLs as encrypted deployment secrets.
4. Run `npm run db:validate:production` to reject local or unencrypted targets.
5. Run `npm run db:deploy` from the deployment pipeline to apply committed migrations.
6. Deploy the application only after migrations succeed.
7. Verify `/api/health` returns HTTP 200 with `database: "reachable"`.

`npm run db:migrate` is for development because it creates migration files and
may ask development-only questions. Production uses `npm run db:deploy`, which
only applies migrations already reviewed and committed to Git.

Do not automatically seed production. The current seed script deletes listing
data and is intentionally a local-development tool.

The health endpoint exposes only `reachable` or `unreachable`; it never returns
the database hostname, credentials, query error, or provider response.

## Photo storage

Local development uses `PHOTO_STORAGE_DRIVER=local` and writes listing photos
under `public/uploads/listings`. This is deliberately blocked when
`NODE_ENV=production`, because files written to a deployed application instance
can disappear during scaling or redeployment.

Production uses the S3-compatible driver. Cloudflare R2 is the recommended
provider for this project, while the same adapter also works with AWS S3 or
another compatible object store.

Required production variables:

```text
PHOTO_STORAGE_DRIVER=s3
S3_BUCKET
S3_REGION
S3_ENDPOINT            # required by R2; optional with AWS S3
S3_ACCESS_KEY_ID       # omit with an AWS IAM role
S3_SECRET_ACCESS_KEY   # omit with an AWS IAM role
PHOTO_PUBLIC_BASE_URL
```

The bucket must permit public reads through `PHOTO_PUBLIC_BASE_URL`, but write
credentials remain server-only. Never prefix storage credentials with
`NEXT_PUBLIC_`.
