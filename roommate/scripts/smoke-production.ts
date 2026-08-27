import "dotenv/config";

type RouteExpectation = {
  path: string;
  contains: string;
};

const routes: RouteExpectation[] = [
  { path: "/", contains: "unitern" },
  { path: "/sign-in", contains: "Sign in" },
  { path: "/sign-up", contains: "Create" },
  { path: "/forgot-password", contains: "Reset your password" },
  { path: "/map", contains: "Explore" },
];

async function main() {
  const baseUrlValue = process.env.SMOKE_BASE_URL?.trim();
  if (!baseUrlValue) throw new Error("SMOKE_BASE_URL is required.");

  const baseUrl = new URL(baseUrlValue);
  if (baseUrl.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(baseUrl.hostname)) {
    throw new Error("SMOKE_BASE_URL must use HTTPS outside local development.");
  }

  for (const route of routes) {
    const response = await fetch(new URL(route.path, baseUrl), { redirect: "manual" });
    if (!response.ok) {
      throw new Error(`${route.path} returned HTTP ${response.status}.`);
    }
    const body = await response.text();
    if (!body.includes(route.contains)) {
      throw new Error(`${route.path} did not contain its expected page marker.`);
    }
    for (const header of ["x-content-type-options", "x-frame-options", "referrer-policy"]) {
      if (!response.headers.has(header)) {
        throw new Error(`${route.path} is missing the ${header} security header.`);
      }
    }
  }

  const healthResponse = await fetch(new URL("/api/health", baseUrl), { cache: "no-store" });
  if (!healthResponse.ok) throw new Error(`/api/health returned HTTP ${healthResponse.status}.`);
  const health = await healthResponse.json() as { status?: unknown; database?: unknown };
  if (health.status !== "ok" || health.database !== "reachable") {
    throw new Error("The application health check did not report a reachable database.");
  }

  console.log(`Production smoke checks passed for ${baseUrl.origin}.`);
}

void main();
