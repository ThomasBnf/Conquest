import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const listLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await client.api.members.locations.$get();
      return await response.json();
    },
  });
};
