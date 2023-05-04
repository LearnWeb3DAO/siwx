import { SIWE } from "@/components/siwe";
import { SIWS } from "@/components/siws";
import { SIWStacks } from "@/components/siwstacks";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center space-y-4 p-24`}
    >
      <p>{JSON.stringify(session)}</p>
      <SIWE />
      <SIWS />
      <SIWStacks />
    </main>
  );
}
