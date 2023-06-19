"use client";

import { SIWTezos } from "@/components/siwTezos";
import { SIWE } from "@/components/siwe";
import { SIWS } from "@/components/siws";
import { SIWStacks } from "@/components/siwstacks";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center space-y-4 p-24`}
    >
      {session && (
        <div className="rounded-md bg-gray-800 p-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">Signed In</h1>

          <div className="flex gap-8 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session?.user.image}
              className="h-16 rounded-full"
              alt="PFP"
            />
            <p className="text-white">{session?.address}</p>
          </div>

          <button
            onClick={() => signOut()}
            className="bg-blue-500 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      )}

      <SIWE />
      <SIWS />
      <SIWStacks />
      <SIWTezos />
    </main>
  );
}
