import { IntegrationProvider } from "@/context/integrationContext";
import { LivestormIntegration } from "@/features/livestorm/livestorm-integration";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listEvents } from "@conquest/db/queries/events/listEvents";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default async function Page({ searchParams: { error } }: Props) {
  const user = await getCurrentUser();

  const events = await listEvents({
    source: "LIVESTORM",
    workspace_id: user.workspace_id,
  });

  return (
    <ScrollArea className="h-full">
      <IntegrationProvider source="LIVESTORM">
        <LivestormIntegration error={error} events={events} />
      </IntegrationProvider>
    </ScrollArea>
  );
}
