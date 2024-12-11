import { client } from "@/lib/rpc";
import type { Channel as SlackChannel } from "@slack/web-api/dist/types/response/ChannelsCreateResponse";
import { useQuery } from "@tanstack/react-query";

export const useListSLackChannels = () => {
  return useQuery({
    queryKey: ["slack", "channels"],
    queryFn: async () => {
      const response = await client.api.slack.channels.$get();
      return (await response.json()) as SlackChannel[];
    },
  });
};
