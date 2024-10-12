import { searchParamsDate } from "@/lib/searchParamsDate";
import { listActivities } from "@/queries/dashboard/listActivities";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Separator } from "@conquest/ui/separator";
import { Percentage } from "./percentage";

export const Activities = async () => {
  const { from, to } = searchParamsDate.all();

  const rActivities = await listActivities({ from, to });
  const { totalActivities, currentActivities, previousPeriodActivities } =
    rActivities?.data ?? {};

  const percentageChange =
    previousPeriodActivities && currentActivities
      ? ((previousPeriodActivities - currentActivities) / currentActivities) *
        100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-medium">Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-medium">
            {currentActivities?.toFixed(0) ?? 0}
          </p>
          <Percentage percentage={percentageChange} />
        </div>
      </CardContent>
      <Separator className="my-0" />
      <CardFooter className="bg-muted p-4 py-2">
        <p>Total {totalActivities?.toFixed(0) ?? 0}</p>
      </CardFooter>
    </Card>
  );
};
