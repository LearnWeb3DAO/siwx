import { getSolanaProvider } from "@/config/config";
import { SiwsMessage } from "@learnweb3dao/siws";
import { getCsrfToken, signIn } from "next-auth/react";
import base58 from "bs58";
import React from "react";

export const SIWS: React.FC = () => {
  const handleLogin = async () => {
    const provider = getSolanaProvider();
    if (provider === null) {
      window.alert("You don't have a Solana wallet - install Phantom");
      return;
    }
    try {
      const resp = await provider.connect();
      const address = resp.publicKey.toString();

      const message = new SiwsMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Solana to this application.",
        uri: window.location.origin,
        version: "1",
        chainId: "solana:mainnet",
        nonce: await getCsrfToken(),
      });

      const signedMessage = await provider.signMessage(
        message.toMessage(),
        "utf8"
      );
      const bs58EncodedSignature = base58.encode(signedMessage.signature);

      signIn("solana", {
        message: JSON.stringify(message),
        redirect: false,
        signature: bs58EncodedSignature,
      });
    } catch (error) {
      window.alert(error);
    }
  };
  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign in with Solana
    </button>
  );
};
