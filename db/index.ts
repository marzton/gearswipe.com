import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type DbEnvironment = {
  DB?: D1Database;
};

declare global {
  var __GEARSWIPE_ENV__: DbEnvironment | undefined;
}

function getRuntimeEnv(): DbEnvironment | undefined {
  return globalThis.__GEARSWIPE_ENV__;
}

export function getDb(env: DbEnvironment = getRuntimeEnv() ?? {}) {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database.",
    );
  }

  return drizzle(env.DB, { schema });
}
