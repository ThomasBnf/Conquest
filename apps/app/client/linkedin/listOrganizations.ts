import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const listOrganizations = () => {
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await client.api.linkedin.organizations.$get();
      return await response.json();
    },
  });

  return {
    ...query,
    organizations: query.data?.results,
  };
};
