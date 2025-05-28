import { IntegrationProvider } from "@/context/integrationContext";
import { DiscordIntegration } from "@/features/discord/discord-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<{
    message: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { message } = await searchParams;

  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="Discord">
        <DiscordIntegration message={message} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
