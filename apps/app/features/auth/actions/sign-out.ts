"use server";

import { signOut } from "@/auth";
import { safeAction } from "lib/safeAction";

export const logOut = safeAction
  .metadata({ name: "logOut" })
  .action(async () => {
    await signOut();
  });
