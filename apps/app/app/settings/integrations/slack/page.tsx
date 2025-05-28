import { IntegrationProvider } from "@/context/integrationContext";
import { SlackIntegration } from "@/features/slack/slack-integration";
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
      <IntegrationProvider source="Slack">
        <SlackIntegration message={message} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
