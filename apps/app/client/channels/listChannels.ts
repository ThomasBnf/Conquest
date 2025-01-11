import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const listChannels = () => {
  const query = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const response = await client.api.channels.$get();
      return await response.json();
    },
  });

  return {
    ...query,
    channels: query.data,
  };
};
