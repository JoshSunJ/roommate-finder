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
