import { DateRangePicker } from "@/components/custom/date-range-picker";
import { Header } from "@/components/layouts/header";
import { EngagementDashboard } from "@/features/dashboard/engagement/engagement-dashboard";
import { MemberDashboard } from "@/features/dashboard/members/member-dashboard";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { searchParamsDate } from "lib/searchParamsDate";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  return (
    <div className="flex h-full flex-col divide-y">
      <Header title="Dashboard">
        <DateRangePicker />
      </Header>
      <ScrollArea>
        <MemberDashboard from={from} to={to} />
        <EngagementDashboard from={from} to={to} />
      </ScrollArea>
    </div>
  );
}
