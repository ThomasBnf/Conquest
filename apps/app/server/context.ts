import { getCacheAuth } from "@/cache/getCacheAuth";

export const createContext = async () => {
  const session = await getCacheAuth();

  return { session };
};

export type Context = typeof createContext;
