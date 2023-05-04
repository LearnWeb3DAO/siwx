import { SiwStacksMessage } from "@learnweb3dao/siwstacks";
import { showConnect, openSignatureRequestPopup } from "@stacks/connect";
import { StacksMainnet } from "@stacks/network";
import { getCsrfToken, signIn } from "next-auth/react";

import React from "react";

export const SIWStacks: React.FC = () => {
  function handleLogin() {
    try {
      showConnect({
        appDetails: {
          name: "SIWx Example",
          icon: window.location.origin + "/favicon.ico",
        },
        redirectTo: "/",
        onFinish: async (payload) => {
          const stxAddress =
            payload.authResponsePayload.profile.stxAddress.mainnet;
          console.log({ stxAddress });
          const message = new SiwStacksMessage({
            domain: window.location.host,
            address: stxAddress,
            statement: "Sign in with Stacks to this application.",
            uri: window.location.origin,
            version: "1",
            chainId: "1",
            nonce: await getCsrfToken(),
          });
          console.log({ message: JSON.stringify(message, null, 2) });

          openSignatureRequestPopup({
            message: message.toMessage(),
            network: new StacksMainnet(),
            appDetails: {
              name: "SIWx Example",
              icon: window.location.origin + "/favicon.ico",
            },
            stxAddress,
            onFinish: (data) => {
              console.log({ data });
              signIn("stacks", {
                message: JSON.stringify(message),
                redirect: false,
                signature: data.signature,
              });
            },
          });
        },
      });
    } catch (error) {
      window.alert(error);
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign in with Stacks
    </button>
  );
};
