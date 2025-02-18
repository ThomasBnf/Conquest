import { signOut } from "@/auth";
import { publicProcedure } from "../trpc";

export const signout = publicProcedure.mutation(async () => {
  await signOut();
});
