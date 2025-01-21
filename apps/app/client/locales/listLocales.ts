import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const listLocales = () => {
  return useQuery({
    queryKey: ["locales"],
    queryFn: async () => {
      const response = await client.api.members.locales.$get();
      return await response.json();
    },
  });
};
