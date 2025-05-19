import { DateRangePicker } from "@/components/custom/date-range-picker";
import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { ActiveMembers } from "@/features/dashboard/active-members";
import { AtRiskMembers } from "@/features/dashboard/at-risk-members";
import { EngagementRate } from "@/features/dashboard/engagement-rate";
import { NewMembers } from "@/features/dashboard/new-members";
import { PotentialAmbassadors } from "@/features/dashboard/potential-ambassadors";
import { TopActivityType } from "@/features/dashboard/top-activity-type";
import { TopChannels } from "@/features/dashboard/top-channels";
import { TotalMembers } from "@/features/dashboard/total-members";
import { WorkspaceHeatmap } from "@/features/dashboard/workspace-heatmap";
import { loaderDate } from "@/utils/dateParams";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  await loaderDate(searchParams);

  return (
    <PageLayout>
      <Header title="Dashboard" />
      <ScrollArea>
        <div className="divide-y">
          <div className="grid grid-cols-2 gap-3 p-3">
            <AtRiskMembers />
            <PotentialAmbassadors />
          </div>
          <div className="flex h-12 items-center justify-between bg-surface px-4">
            <p className="font-medium text-base">Metrics</p>
            <DateRangePicker />
          </div>
          <div className="grid grid-cols-4 gap-3 p-3">
            <TotalMembers />
            <NewMembers />
            <ActiveMembers />
            <EngagementRate />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 p-3">
          <WorkspaceHeatmap className="col-span-3" />
          <div className="col-span-3 grid grid-cols-2 gap-3">
            <TopActivityType />
            <TopChannels />
          </div>
        </div>
      </ScrollArea>
    </PageLayout>
  );
}
