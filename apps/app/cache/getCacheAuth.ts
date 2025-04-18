import { auth } from "@/auth";
import { cache } from "react";

export const getCacheAuth = cache(async () => {
  const session = await auth();
  console.log("session");
  return session;
});
