import { SiwTezosMessage } from "@learnweb3dao/siwTezos";
import { SiweMessage } from "@learnweb3dao/siwe";
import { SiwsMessage } from "@learnweb3dao/siws";
import { SiwStacksMessage } from "@learnweb3dao/siwstacks";
import { SiwStarknetMessage } from "@learnweb3dao/siwstarknet";
import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, getAuthOptions(req));
}

export const getAuthOptions = (req: NextApiRequest) => {
  const providers = [
    CredentialsProvider({
      id: "ethereum",
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },

      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          });

          console.log({ result });

          if (!result.success) return null;

          return {
            id: siwe.address,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "solana",
      name: "Solana",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },

      async authorize(credentials) {
        try {
          const siws = new SiwsMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          const result = await siws.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          });

          if (!result.success) return null;

          return {
            id: siws.address,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "stacks",
      name: "Stacks",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },

      async authorize(credentials) {
        try {
          const siwStacks = new SiwStacksMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          const result = await siwStacks.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          });

          console.log({ result });

          if (!result.success) return null;

          return {
            id: siwStacks.address,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "tezos",
      name: "Tezos",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },

      async authorize(credentials, request) {
        try {
          console.log({ credentials });
          const siwTezos = new SiwTezosMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });
          const result = await siwTezos.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: csrfToken,
          });

          console.log({ result });

          if (!result.success) return null;

          return {
            id: siwTezos.address,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "starknet",
      name: "Starknet",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        pubKey: {
          label: "Public Key",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          console.log({ credentials });
          const siwStarknet = new SiwStarknetMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });
          const result = await siwStarknet.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: csrfToken,
            pubKey: credentials?.pubKey || "",
          });

          console.log({ result });

          if (!result.success) return null;

          return {
            id: siwStarknet.address,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth?.includes("signin");

  if (isDefaultSigninPage) {
    providers.splice(-4, 4);
  }

  const authOptions: NextAuthOptions = {
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: Session; token: JWT }) {
        session.address = token.sub || "";
        session.user.name = token.sub || "";
        session.user.image = "https://picsum.photos/500";
        return session;
      },
    },
  };

  return authOptions;
};
