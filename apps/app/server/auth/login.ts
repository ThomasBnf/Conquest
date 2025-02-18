import { signIn } from "@/auth";
import { LoginSchema } from "@conquest/zod/schemas/auth.schema";
import { TRPCError } from "@trpc/server";
import { AuthError } from "next-auth";
import { publicProcedure } from "../trpc";

export const login = publicProcedure
  .input(LoginSchema)
  .mutation(async ({ input }) => {
    const { email, password } = input;

    try {
      await signIn("credentials", {
        email,
        password,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid credentials.",
            });
          default:
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong.",
            });
        }
      }
    }
  });
