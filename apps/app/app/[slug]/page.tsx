import { DateRangePicker } from "@/components/custom/date-range-picker";
import { MemberDashboard } from "@/features/dashboard/members/member-dashboard";
import { prisma } from "@/lib/prisma";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { searchParamsDate } from "lib/searchParamsDate";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  const { from, to } = searchParamsDate.parse(searchParams);

  const activities = await prisma.activity.groupBy({
    by: ["external_id"],
    _count: {
      external_id: true,
    },
    having: {
      external_id: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  console.log(activities);

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <p className="font-medium text-foreground">Dashboard</p>
        <DateRangePicker />
      </div>
      <ScrollArea>
        <MemberDashboard from={from} to={to} />
        {/* <EngagementDashboard from={from} to={to} /> */}
      </ScrollArea>
    </div>
  );
}
