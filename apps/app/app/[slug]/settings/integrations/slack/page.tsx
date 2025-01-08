import { Slack } from "@/components/icons/Slack";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { ConnectedCard } from "@/features/slack/connected-card";
import { EnableCard } from "@/features/slack/enable-card";
import { listChannels } from "@/queries/channels/listChannels";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default async function Page({ searchParams: { error } }: Props) {
  const user = await getCurrentUser();

  const channels = await listChannels({
    source: "SLACK",
    workspace_id: user?.workspace_id,
  });

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Slack />
          </div>
          <p className="font-medium text-lg">Slack</p>
        </div>
        <EnableCard error={error} />
        <ConnectedCard channels={channels} />
      </div>
    </ScrollArea>
  );
}
