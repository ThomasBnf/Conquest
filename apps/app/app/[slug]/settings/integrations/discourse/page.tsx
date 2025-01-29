import { DiscourseIntegration } from "@/features/integrations/discourse-integration";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listChannels } from "@conquest/db/queries/channels/listChannels";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: {
    error: string;
  };
};

export default async function Page({ searchParams: { error } }: Props) {
  const user = await getCurrentUser();

  const channels = await listChannels({
    source: "DISCOURSE",
    workspace_id: user?.workspace_id,
  });

  return (
    <ScrollArea className="h-dvh">
      <DiscourseIntegration error={error} channels={channels} />
    </ScrollArea>
  );
}
