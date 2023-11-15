import React from "react";
import { StarknetWindowObject, connect, disconnect } from "starknetkit";
import { SiwStarknetMessage } from "@learnweb3dao/siwstarknet";
import { getCsrfToken, signIn } from "next-auth/react";
import {
  TypedData,
  WeierstrassSignatureType,
  hash,
  shortString,
} from "starknet";

export const SIWStarknet: React.FC = () => {
  const handleLogin = async () => {
    const connection = await connect({
      modalMode: "alwaysAsk",
    });

    if (!connection || !connection.isConnected) {
      window.alert("Could not connect to Starknet wallet");
      return;
    }

    try {
      const address = connection.selectedAddress;

      const message = new SiwStarknetMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Starknet to this application.",
        uri: window.location.origin,
        version: "1",
        chainId: "starknet:SN_MAIN",
        nonce: await getCsrfToken(),
      });

      const pubKey = await connection.account.signer.getPubKey();

      const typedData = message.toMessage();
      const sig = await connection.account.signMessage(typedData);

      signIn("starknet", {
        message: JSON.stringify(message),
        redirect: false,
        signature: sig.join(","),
        pubKey: pubKey,
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
      Sign in with Starknet
    </button>
  );
};
