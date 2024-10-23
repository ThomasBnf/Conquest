import { listActiveMembers } from "@/actions/dashboard/listActiveMembers";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Separator } from "@conquest/ui/separator";
import { searchParamsDate } from "lib/searchParamsDate";
import { Percentage } from "./percentage";

export const ActiveMembers = async () => {
  const { from, to } = searchParamsDate.all();

  const rActiveMembers = await listActiveMembers({ from, to });
  const { totalActive, currentActive, previousPeriodActive } =
    rActiveMembers?.data ?? {};

  const percentageChange =
    previousPeriodActive && currentActive
      ? ((previousPeriodActive - currentActive) / currentActive) * 100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm">Returning Members</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-medium">{currentActive ?? 0}</p>
          <Percentage percentage={percentageChange} />
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="bg-muted p-4 py-2">
        <p>Total {totalActive ?? 0} </p>
      </CardFooter>
    </Card>
  );
};
