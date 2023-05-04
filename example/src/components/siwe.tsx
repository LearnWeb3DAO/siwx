"use client";

import { SiweMessage } from "@learnweb3dao/siwe";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export const SIWE: React.FC = () => {
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      if (!session) {
        handleLogin();
      }
    },
  });
  const { data: session } = useSession();

  const handleLogin = async () => {
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to this application.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id.toString(),
        nonce: await getCsrfToken(),
      });

      const signature = await signMessageAsync({
        message: message.toMessage(),
      });

      signIn("ethereum", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (!isConnected) {
          connect();
          handleLogin();
        } else {
          handleLogin();
        }
      }}
      className="bg-blue-500 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded"
    >
      Sign in with Ethereum
    </button>
  );
};
