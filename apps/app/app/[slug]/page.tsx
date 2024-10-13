import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { ChartActiveContacts } from "features/dashboard/charts/chart-active-contacts";
import { ChartActivityType } from "features/dashboard/charts/chart-activity-type";
import { ChartContacts } from "features/dashboard/charts/chart-contacts";
import { ChartEngagement } from "features/dashboard/charts/chart-engagement";
import { DateRangePicker } from "features/dashboard/date-range-picker";
import { ActiveContacts } from "features/dashboard/metrics/active-contacts";
import { Activities } from "features/dashboard/metrics/activities";
import { Contacts } from "features/dashboard/metrics/contacts";
import { EngagementRate } from "features/dashboard/metrics/engagement-rate";
import { searchParamsDate } from "lib/searchParamsDate";
import { listActivities } from "queries/activities/listActivities";
import { listContacts } from "queries/contacts/listContacts";
import { listEngagement } from "queries/dashboard/listEngagement";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  const rContacts = await listContacts({});
  const contacts = rContacts?.data;

  const rActivities = await listActivities({ from, to });
  const activities = rActivities?.data;

  const rEngagement = await listEngagement({ from, to });
  const engagement = rEngagement?.data;
  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <p className="font-medium">Dashboard</p>
        <DateRangePicker />
      </div>
      <ScrollArea>
        <div className="grid grid-cols-4 gap-4 p-4">
          <Contacts />
          <ActiveContacts />
          <Activities />
          <EngagementRate />
        </div>
        <Separator />
        <div className="flex flex-col gap-4 p-4">
          <ChartContacts contacts={contacts} />
          <ChartActiveContacts contacts={contacts} />
          <ChartEngagement dailyEngagement={engagement} />
          <ChartActivityType activities={activities} />
        </div>
      </ScrollArea>
    </div>
  );
}
