import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { DefaultSeo } from "next-seo";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <DefaultSeo
        title="bench.audio"
        description="bench.audio is the battle ground for voice agents"
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
  );
};

export default api.withTRPC(MyApp);
