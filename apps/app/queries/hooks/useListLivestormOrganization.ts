import { client } from "@/lib/rpc";
import type { Organization } from "@conquest/zod/schemas/types/livestorm";
import { useQuery } from "@tanstack/react-query";

export const useListLivestormOrganization = () => {
  return useQuery({
    queryKey: ["livestorm-organization"],
    queryFn: async () => {
      const response = await client.api.livestorm.organization.$get();

      return (await response.json()) as Organization;
    },
  });
};
