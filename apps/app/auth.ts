import { PrismaAdapter } from "@auth/prisma-adapter";
import { LoginSchema } from "@conquest/zod/auth.schema";
import { UserWithWorkspaceSchema } from "@conquest/zod/user.schema";
import { compare } from "bcryptjs";
import { prisma } from "lib/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({
            where: {
              email,
            },
            include: {
              workspace: true,
            },
          });

          if (!user || !user.hashed_password) return null;

          const isValidPassword = await compare(password, user.hashed_password);
          if (isValidPassword) return UserWithWorkspaceSchema.parse(user);
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.accessToken = user.id;
      }
      return token;
    },
  },
});
