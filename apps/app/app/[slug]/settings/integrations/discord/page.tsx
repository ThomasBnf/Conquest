import { DiscordIntegration } from "@/features/integrations/discord-integration";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listChannels } from "@conquest/db/queries/channels/listChannels";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default async function Page({ searchParams: { error } }: Props) {
  const user = await getCurrentUser();

  const channels = await listChannels({
    source: "DISCORD",
    workspace_id: user?.workspace_id,
  });

  return (
    <ScrollArea className="h-dvh">
      <DiscordIntegration error={error} channels={channels} />
    </ScrollArea>
  );
}
