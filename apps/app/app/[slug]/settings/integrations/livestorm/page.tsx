import { Livestorm } from "@/components/icons/Livestorm";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ConnectedCard } from "@/features/livestorm/connected-card";
import { EnableCard } from "@/features/livestorm/enable-card";
import { EventsList } from "@/features/livestorm/events-list";
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
  const { workspace_id } = user;

  const events = await listEvents({ source: "LIVESTORM", workspace_id });

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Livestorm />
          </div>
          <p className="font-medium text-lg">Livestorm</p>
        </div>
        <EnableCard error={error} />
        <ConnectedCard />
        <EventsList events={events} />
      </div>
    </ScrollArea>
  );
}
