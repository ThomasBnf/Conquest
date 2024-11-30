"use server";

import { signIn } from "@/auth";
import { LoginSchema } from "@conquest/zod/auth.schema";
import { safeAction } from "lib/safeAction";
import { AuthError } from "next-auth";

export const _logIn = safeAction
  .metadata({ name: "_logIn" })
  .schema(LoginSchema)
  .action(async ({ parsedInput: { email, password, redirectTo } }) => {
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: redirectTo || "/",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid credentials." };
          default:
            return { error: "Something went wrong." };
        }
      }
      throw error;
    }
  });
