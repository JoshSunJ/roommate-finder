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
