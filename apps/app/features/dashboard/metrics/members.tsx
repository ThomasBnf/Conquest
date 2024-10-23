import { listMembers } from "@/actions/dashboard/listMembers";
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

export const Members = async () => {
  const { from, to } = searchParamsDate.all();

  const rMembers = await listMembers({ from, to });
  const { totalMembers, currentMembers, previousPeriodMembers } =
    rMembers?.data ?? {};

  const percentageChange =
    previousPeriodMembers && currentMembers
      ? ((previousPeriodMembers - currentMembers) / currentMembers) * 100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-medium">Members</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-medium">+{currentMembers ?? 0}</p>
          <Percentage percentage={percentageChange} />
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="bg-muted p-4 py-2">
        <p>Total {totalMembers ?? 0} </p>
      </CardFooter>
    </Card>
  );
};
