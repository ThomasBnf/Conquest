import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Separator } from "@conquest/ui/separator";
import { searchParamsDate } from "lib/searchParamsDate";
import { listActiveContacts } from "queries/dashboard/listActiveContacts";
import { Percentage } from "./percentage";

export const ActiveContacts = async () => {
  const { from, to } = searchParamsDate.all();

  const rActiveContacts = await listActiveContacts({ from, to });
  const { totalActive, currentActive, previousPeriodActive } =
    rActiveContacts?.data ?? {};

  const percentageChange =
    previousPeriodActive && currentActive
      ? ((previousPeriodActive - currentActive) / currentActive) * 100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
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
