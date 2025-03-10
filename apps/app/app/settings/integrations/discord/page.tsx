import { IntegrationProvider } from "@/context/integrationContext";
import { DiscordIntegration } from "@/features/discord/discord-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<{
    error: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="Discord">
        <DiscordIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
