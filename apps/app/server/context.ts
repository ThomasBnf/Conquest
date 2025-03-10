import { auth } from "@/auth";
import { headers } from "next/headers";

export const createContext = async () => {
  const session = await auth();

  return { session };
};

export type Context = typeof createContext;
