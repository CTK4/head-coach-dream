#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function matchRoute(pattern, path) {
  return new RegExp(`^${pattern}$`).test(path);
}

function expectedDestination(destTemplate, path, srcPattern) {
  const match = path.match(new RegExp(`^${srcPattern}$`));
  if (!match) {
    return null;
  }

  let destination = destTemplate;
  for (let index = 1; index < match.length; index += 1) {
    destination = destination.replaceAll(`$${index}`, match[index]);
  }
  return destination;
}

async function run() {
  const vercelConfigRaw = await readFile(join(root, "vercel.json"), "utf8");
  const vercelConfig = JSON.parse(vercelConfigRaw);
  const routes = vercelConfig.routes ?? [];

  assert(Array.isArray(routes) && routes.length >= 3, "vercel.json must define ordered routes for filesystem, API, and SPA fallback");
  assert(routes[0]?.handle === "filesystem", "vercel.json must keep filesystem handling first so static assets are served before rewrites");

  const apiRoute = routes.find((route) => route.src === "/api/(.*)");
  assert(apiRoute, "Missing explicit API passthrough route for /api/*");
  assert(apiRoute.dest === "/api/$1", "API passthrough route must preserve requested API subpath");

  const fallbackRoute = routes[routes.length - 1];
  assert(fallbackRoute?.src === "/(.*)" && fallbackRoute?.dest === "/", "Last route must remain SPA fallback to /");

  const smokeCases = [
    { path: "/api/v1/health", expectedDest: "/api/v1/health", route: apiRoute, name: "api-prefix is exempted from SPA fallback" },
    { path: "/hub/season", expectedDest: "/", route: fallbackRoute, name: "SPA deep links resolve through fallback" },
    { path: "/assets/main.js", expectedDest: "filesystem", route: routes[0], name: "static assets stay on filesystem route" },
  ];

  for (const smokeCase of smokeCases) {
    if (smokeCase.expectedDest === "filesystem") {
      assert(smokeCase.route.handle === "filesystem", `[deploy-smoke] ${smokeCase.name}: expected filesystem handler`);
      continue;
    }

    const matches = matchRoute(smokeCase.route.src, smokeCase.path);
    assert(matches, `[deploy-smoke] ${smokeCase.name}: path ${smokeCase.path} did not match ${smokeCase.route.src}`);

    const resolved = expectedDestination(smokeCase.route.dest, smokeCase.path, smokeCase.route.src);
    assert(resolved === smokeCase.expectedDest, `[deploy-smoke] ${smokeCase.name}: expected ${smokeCase.expectedDest}, got ${resolved}`);
  }

  console.log("[deploy-smoke] OK: routing preserves SPA fallback and exempts /api/* prefixes");
}

run().catch((error) => {
  console.error("[deploy-smoke] FAIL", error.message);
  process.exitCode = 1;
});
