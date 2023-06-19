import React, { useState, useEffect } from "react";
import { SiwTezosMessage } from "@learnweb3dao/siwTezos";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { getCsrfToken, signIn } from "next-auth/react";
import { SigningType } from "@airgap/beacon-types";

export const SIWTezos: React.FC = () => {
  const [tezos, setTezos] = React.useState<TezosToolkit>(
    new TezosToolkit("https://mainnet.api.tez.ie")
  );
  const [wallet, setWallet] = useState<BeaconWallet | null>(null);

  async function handleLogin() {
    try {
      await wallet?.requestPermissions();

      const activeAccount = await wallet?.client.getActiveAccount();
      const pubKey = activeAccount?.publicKey;
      const userAddress = await wallet?.getPKH();

      const message = new SiwTezosMessage({
        domain: window.location.host,
        address: userAddress,
        statement: "Sign in with Tezos to this application.",
        uri: window.location.origin,
        version: "1",
        chainId: "NetXdQprcVkpaWU",
        nonce: await getCsrfToken(),
      });
      console.log({ message: JSON.stringify(message, null, 2) });

      const { signature } = await wallet!.client.requestSignPayload({
        signingType: SigningType.MICHELINE,
        payload: message.toMessage(),
      });

      const fullSignature = signature + pubKey;

      signIn("tezos", {
        message: JSON.stringify(message),
        redirect: false,
        signature: fullSignature,
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    (async () => {
      // creates a wallet instance
      const wallet = new BeaconWallet({
        name: "SIWx Sample App",
      });
      tezos.setWalletProvider(wallet);
      setWallet(wallet);
    })();
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign in with Tezos
    </button>
  );
};
