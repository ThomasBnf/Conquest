import { IntegrationProvider } from "@/context/integrationContext";
import { SlackIntegration } from "@/features/slack/slack-integration";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default function Page({ searchParams: { error } }: Props) {
  return (
    <ScrollArea className="h-dvh">
      <IntegrationProvider source="SLACK">
        <SlackIntegration error={error} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
