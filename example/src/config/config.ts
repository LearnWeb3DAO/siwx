import { AppConfig, UserSession } from "@stacks/connect";
import { configureChains, createClient } from "wagmi";
import { arbitrum, mainnet, optimism, polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// Ethereum - Wagmi Configuration
const { provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
});

// Solana
export const getSolanaProvider = () => {
  if ("phantom" in window) {
    const anyWindow: any = window;
    const provider = anyWindow.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }

  return null;
};

// Stacks
export const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });
