import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useListChannels = () => {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const response = await client.api.channels.$get();
      return await response.json();
    },
  });
};
