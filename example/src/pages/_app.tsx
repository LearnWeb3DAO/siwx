import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { wagmiClient } from "@/config/config";
import { WagmiConfig } from "wagmi";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>
    </SessionProvider>
  );
}
