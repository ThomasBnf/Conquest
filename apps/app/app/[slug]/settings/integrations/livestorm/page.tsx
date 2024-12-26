import { Livestorm } from "@/components/icons/Livestorm";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ConnectedCard } from "@/features/livestorm/connected-card";
import { EnableCard } from "@/features/livestorm/enable-card";
import { EventsList } from "@/features/livestorm/events-list";
import { listEvents } from "@/queries/events/listEvents";
import { ScrollArea } from "@conquest/ui/src/components/scroll-area";

export default async function Page() {
  const events = await listEvents({ source: "LIVESTORM" });

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 py-16">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Livestorm />
          </div>
          <p className="font-medium text-lg">Livestorm</p>
        </div>
        <EnableCard />
        <ConnectedCard />
        <EventsList events={events} />
      </div>
    </ScrollArea>
  );
}
