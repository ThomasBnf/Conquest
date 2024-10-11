"use server";

import { safeAction } from "@/lib/safeAction";
import { LoginSchema } from "@/schemas/auth.schema";
import { AuthError } from "next-auth";
import { signIn } from "../auth";

export const logIn = safeAction
  .metadata({ name: "logIn" })
  .schema(LoginSchema)
  .action(async ({ parsedInput: { email, password, redirectTo } }) => {
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: true,
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
