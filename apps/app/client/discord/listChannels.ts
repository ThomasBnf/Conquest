import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const listDiscordChannels = () => {
  const query = useQuery({
    queryKey: ["discord-channels"],
    queryFn: async () => {
      const response = await client.api.discord.channels.$get();
      return await response.json();
    },
  });

  return {
    ...query,
    discordChannels: query.data,
  };
};
