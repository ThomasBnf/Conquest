import { Discourse } from "@/components/icons/Discourse";
import { ConnectedCard } from "@/features/discourse/connected-card";
import { EnabledCard } from "@/features/discourse/enabled-card";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ScrollArea } from "@conquest/ui/src/components/scroll-area";

export default function Page() {
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Discourse />
          </div>
          <p className="font-medium text-lg">Discourse</p>
        </div>
        <EnabledCard />
        <ConnectedCard />
      </div>
    </ScrollArea>
  );
}
