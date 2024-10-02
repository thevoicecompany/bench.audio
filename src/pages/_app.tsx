/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { AppType } from "next/app";

import { Inter } from "next/font/google";
import { DefaultSeo } from "next-seo";
import { Toaster } from "react-hot-toast";

import "~/styles/globals.css";

import { api } from "~/utils/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { Analytics } from "@vercel/analytics/react";

import { env } from "~/env";

if (typeof window !== "undefined") {
  // checks that we are client-side
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug(); // debug mode in development
    },
  });
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <PostHogProvider client={posthog}>
      <main className={`font-sans ${inter.variable}`}>
        <Analytics />
        <DefaultSeo
          title="bench.audio"
          description="bench.audio is the battleground for voice agents"
          openGraph={{
            type: "website",
            url: "https://bench.audio",
            images: [
              {
                url: "https://bench.audio/hero.png",
              },
            ],
          }}
          twitter={{
            handle: "@sfvoicecompany",
            cardType: "summary_large_image",
          }}
        />
        <Toaster position="top-right" />
        <Component {...pageProps} />
      </main>
    </PostHogProvider>
  );
};

export default api.withTRPC(MyApp);
