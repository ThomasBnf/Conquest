import { client } from "@/lib/rpc";
import { OrganizationSchema } from "@conquest/zod/types/livestorm";
import { useQuery } from "@tanstack/react-query";

export const listLivestormOrganization = () => {
  const query = useQuery({
    queryKey: ["livestorm-organization"],
    queryFn: async () => {
      const response = await client.api.livestorm.organization.$get();
      const { data, included } = OrganizationSchema.parse(
        await response.json(),
      );

      return { data, included };
    },
  });

  return {
    ...query,
    organization: query.data,
  };
};
