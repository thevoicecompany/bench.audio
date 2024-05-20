import { $ } from "bun";

import { env } from "~/env";

if (!env.DATABASE_URL_PROD) {
  console.log("DATABASE_URL_PROD is not set");
  process.exit(1);
}

const url = env.DATABASE_URL_PROD;

await $`DATABASE_URL=${url} bun prisma migrate deploy`;
