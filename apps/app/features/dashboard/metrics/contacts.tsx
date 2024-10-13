import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Separator } from "@conquest/ui/separator";
import { searchParamsDate } from "lib/searchParamsDate";
import { listContacts } from "queries/dashboard/listContacts";
import { Percentage } from "./percentage";

export const Contacts = async () => {
  const { from, to } = searchParamsDate.all();

  const rContacts = await listContacts({ from, to });
  const { totalContacts, currentContacts, previousPeriodContacts } =
    rContacts?.data ?? {};

  const percentageChange =
    previousPeriodContacts && currentContacts
      ? ((previousPeriodContacts - currentContacts) / currentContacts) * 100
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-medium">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-medium">+{currentContacts ?? 0}</p>
          <Percentage percentage={percentageChange} />
        </div>
      </CardContent>
      <Separator className="my-0" />
      <CardFooter className="bg-muted p-4 py-2">
        <p>Total {totalContacts ?? 0} </p>
      </CardFooter>
    </Card>
  );
};
