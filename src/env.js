import { z } from "zod";

import { createEnv } from "@t3-oss/env-nextjs";


export const providerKeys = z.object({
  vapi: z.string(),
  retell: z.string(),
  // bland: z.string(),
})

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_PROD: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    VAPI_API_KEY: z.string(),
    RETELL_API_KEY: z.string(),
    HUME_API_KEY: z.string(),
    HUME_CLIENT_SECRET: z.string(),
    ULTRAVOX_API_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_VAPI_API_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_PROD: process.env.DATABASE_URL_PROD,
    NODE_ENV: process.env.NODE_ENV,
    VAPI_API_KEY: process.env.VAPI_API_KEY,
    RETELL_API_KEY: process.env.RETELL_API_KEY,
    NEXT_PUBLIC_VAPI_API_KEY: process.env.NEXT_PUBLIC_VAPI_API_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    HUME_CLIENT_SECRET: process.env.HUME_CLIENT_SECRET,
    HUME_API_KEY: process.env.HUME_API_KEY,
    ULTRAVOX_API_KEY: process.env.ULTRAVOX_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
