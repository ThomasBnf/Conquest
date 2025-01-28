import { LivestormIntegration } from "@/features/integrations/livestorm-integration";
import { listEvents } from "@/queries/events/listEvents";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
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
      <LivestormIntegration error={error} events={events} />
    </ScrollArea>
  );
}
