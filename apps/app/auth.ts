import { prisma } from "@conquest/db/prisma";
import { env } from "@conquest/env";
import { resend } from "@conquest/resend";
import MagicLink from "@conquest/resend/emails/magic-link";
import { type User, UserSchema } from "@conquest/zod/schemas/user.schema";
import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createAuthPrismaAdapter } from "./lib/createPrismaAdapter";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.AUTH_SECRET,
  adapter: createAuthPrismaAdapter(prisma),
  providers: [
    Resend({
      maxAge: 5 * 60,
      sendVerificationRequest: async ({ identifier, url }) => {
        await resend.emails.send({
          from: "Conquest <hello@useconquest.com>",
          to: identifier,
          subject: "Login for Conquest",
          react: MagicLink({ url }),
        });
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: UserSchema.parse(user),
    }),
  },
});
