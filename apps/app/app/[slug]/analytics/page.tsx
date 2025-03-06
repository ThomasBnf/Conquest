import { PageLayout } from "@/components/layouts/page-layout";
import { TabsIntegrations } from "@/features/dashboard/tabs-integrations";
import { TotalMembersBySource } from "@/features/dashboard/total-members-by-source";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default function Page() {
  return (
    <PageLayout>
      <TabsIntegrations />
      <ScrollArea>
        <div className="grid grid-cols-2 gap-2 p-4">
          <TotalMembersBySource source="Slack" />
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
