import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { ActiveMembers } from "@/features/dashboard/active-members";
import { AtRiskMembers } from "@/features/dashboard/at-risk-members";
import { EngagementRate } from "@/features/dashboard/engagement-rate";
import { GlobalDateRange } from "@/features/dashboard/global-date-range";
import { Leaderboard } from "@/features/dashboard/leaderboard";
import { NewMembers } from "@/features/dashboard/new-members";
import { PotentialAmbassadors } from "@/features/dashboard/potential-ambassadors";
import { TopActivityTypes } from "@/features/dashboard/top-activity-types";
import { TotalMembers } from "@/features/dashboard/total-members";
import { WorkspaceHeatmap } from "@/features/dashboard/workspace-heatmap";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default async function Page() {
  return (
    <PageLayout>
      <Header title="Dashboard">
        <GlobalDateRange />
      </Header>
      <ScrollArea>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4 ">
            <TotalMembers />
            <ActiveMembers />
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <NewMembers />
            <EngagementRate />
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <AtRiskMembers />
            <PotentialAmbassadors />
          </div>
          <WorkspaceHeatmap />
          <div className="grid grid-cols-2 gap-4 ">
            <TopActivityTypes />
            <Leaderboard />
          </div>
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
