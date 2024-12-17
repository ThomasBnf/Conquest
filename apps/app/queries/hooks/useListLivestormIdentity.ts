import { client } from "@/lib/rpc";
import type { Identity } from "@conquest/zod/schemas/types/livestorm";
import { useQuery } from "@tanstack/react-query";

export const useListLivestormIdentity = () => {
  return useQuery({
    queryKey: ["livestorm-identity"],
    queryFn: async () => {
      const response = await client.api.livestorm.identity.$get();

      return (await response.json()) as Identity;
    },
  });
};
