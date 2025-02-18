import { IntegrationProvider } from "@/context/integrationContext";
import { DiscordIntegration } from "@/features/discord/discord-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="DISCORD">
        <DiscordIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
