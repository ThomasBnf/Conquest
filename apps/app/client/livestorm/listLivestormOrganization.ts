import { client } from "@/lib/rpc";
import type { Organization } from "@conquest/zod/types/livestorm";
import { useQuery } from "@tanstack/react-query";

export const listLivestormOrganization = () => {
  const query = useQuery({
    queryKey: ["livestorm-organization"],
    queryFn: async () => {
      const response = await client.api.livestorm.organization.$get();
      const data = (await response.json()) as Organization;

      return { ...data.data, included: data.included };
    },
  });

  return {
    ...query,
    organization: query.data,
  };
};
