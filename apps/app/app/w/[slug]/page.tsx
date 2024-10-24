import { ActiveMembers } from "@/features/dashboard/metrics/active-members";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { listActivities } from "actions/activities/listActivities";
import { listEngagement } from "actions/dashboard/listEngagement";
import { ChartActivityType } from "features/dashboard/charts/chart-activity-type";
import { ChartEngagement } from "features/dashboard/charts/chart-engagement";
import { DateRangePicker } from "features/dashboard/date-range-picker";
import { Activities } from "features/dashboard/metrics/activities";
import { EngagementRate } from "features/dashboard/metrics/engagement-rate";
import { Members } from "features/dashboard/metrics/members";
import { searchParamsDate } from "lib/searchParamsDate";
// import { listMembers } from "actions/members/listMembersAc";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  // const rMembers = await listMembers({});
  // const members = rMembers?.data;

  const rActivities = await listActivities({ from, to });
  const activities = rActivities?.data;

  const rEngagement = await listEngagement({ from, to });
  const engagement = rEngagement?.data;

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <p className="font-medium text-foreground">Dashboard</p>
        <DateRangePicker />
      </div>
      <ScrollArea>
        <div className="grid grid-cols-4 gap-4 p-4">
          <Members />
          <ActiveMembers />
          <Activities />
          <EngagementRate />
        </div>
        <Separator />
        <div className="flex flex-col gap-4 p-4">
          {/* <ChartMembers members={members} />
          <ChartActiveMembers members={members} /> */}
          <ChartEngagement dailyEngagement={engagement} />
          <ChartActivityType activities={activities} />
        </div>
      </ScrollArea>
    </div>
  );
}
