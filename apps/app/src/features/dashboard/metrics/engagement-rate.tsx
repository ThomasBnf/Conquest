import { searchParamsDate } from "@/lib/searchParamsDate";
import { engagementRate } from "@/queries/dashboard/engagementRate";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Separator } from "@conquest/ui/separator";
import { Percentage } from "./percentage";

export const EngagementRate = async () => {
  const { from, to } = searchParamsDate.all();

  const rEngagementRate = await engagementRate({ from, to });
  const {
    totalEngagementRate,
    currentEngagementRate,
    previousPeriodEngagementRate,
  } = rEngagementRate?.data ?? {};

  const percentageChange =
    previousPeriodEngagementRate && currentEngagementRate
      ? ((previousPeriodEngagementRate - currentEngagementRate) /
          currentEngagementRate) *
        100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm">Engagement Rate</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-medium">
            {isNaN(currentEngagementRate ?? 0)
              ? 0
              : currentEngagementRate?.toFixed(0)}
            %
          </p>
          <Percentage percentage={percentageChange} />
        </div>
      </CardContent>
      <Separator className="my-0" />
      <CardFooter className="bg-muted p-4 py-2">
        <p>
          All time{" "}
          {isNaN(totalEngagementRate ?? 0)
            ? 0
            : totalEngagementRate?.toFixed(0)}{" "}
          %
        </p>
      </CardFooter>
    </Card>
  );
};
