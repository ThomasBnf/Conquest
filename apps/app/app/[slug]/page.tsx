import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { ActiveMembers } from "@/features/dashboard-v2/active-members";
import { EngagementRate } from "@/features/dashboard-v2/engagement-rate";
import { NewMembers } from "@/features/dashboard-v2/new-members";
import { TopActivityTypes } from "@/features/dashboard-v2/top-activity-types";
import { TotalMembers } from "@/features/dashboard-v2/total-members";
import { AtRiskMembers } from "@/features/dashboard/at-risk-members";
import { PotentialAmbassadors } from "@/features/dashboard/potential-ambassadors";
import { WorkspaceHeatmap } from "@/features/dashboard/workspace-heatmap";
import { loaderDate } from "@/utils/dateParams";
import { ScrollArea } from "@conquest/ui/scroll-area";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  await loaderDate(searchParams);

  return (
    <PageLayout>
      <Header title="Dashboard" />
      <ScrollArea className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AtRiskMembers />
            <PotentialAmbassadors />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TotalMembers />
            <ActiveMembers />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NewMembers />
            <EngagementRate />
          </div>
          <WorkspaceHeatmap />
          <TopActivityTypes />
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
