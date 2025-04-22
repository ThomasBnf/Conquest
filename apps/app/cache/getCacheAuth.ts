import { auth } from "@/auth";
import { cache } from "react";

export const getCacheAuth = cache(async () => {
  return await auth();
});
