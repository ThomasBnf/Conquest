"use client";

import { DatePicker } from "@/components/custom/date-picker";
import { useDateRange } from "@/hooks/useDateRange";
import { dateParser } from "@/lib/searchParamsDate";
import { trpc } from "@/server/client";
import { Separator } from "@conquest/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@conquest/ui/table";
import { useQueryStates } from "nuqs";

export const AtRiskMembers = () => {
  const { date } = useDateRange();
  const { from, to } = date;

  const { data } = trpc.dashboard.atRiskMembers.useQuery({
    from,
    to,
  });

  return (
    <div className="mb-0.5 flex flex-col overflow-hidden rounded-md border shadow-sm">
      <div className="flex items-center justify-between bg-sidebar p-3">
        <p className="font-medium text-lg">At risk members</p>
        <DatePicker />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-3">Member</TableHead>
              <TableHead className="px-3">Pulse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.first_name} {member.last_name}
                </TableCell>
                <TableCell>{member.pulse}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
