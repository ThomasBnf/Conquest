import { createClient } from "@clickhouse/client-web";
import { LoginSchema } from "@conquest/zod/schemas/auth.schema";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import ClickhouseAdapter from "./lib/clickhouseAdapter";

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: ClickhouseAdapter(client),
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const result = await client.query({
            query: `
              SELECT * FROM users
              WHERE email = '${email}'
            `,
            format: "JSON",
          });

          const { data } = await result.json();
          const user = UserSchema.parse(data.at(0));

          if (!user || !user.hashed_password) return null;

          const isValidPassword = await compare(password, user.hashed_password);
          if (isValidPassword) return user;

          return null;
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
