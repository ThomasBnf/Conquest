"use client";

import { TooltipInfo } from "@/components/badges/tooltip-info";
import { QueryInput } from "@/components/custom/query-input";
import { dateParams } from "@/lib/dateParams";
import { tableParams } from "@/lib/tableParams";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@conquest/ui/sheet";
import { Skeleton } from "@conquest/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { PanelRight } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { ExportListMembers } from "../members/export-list-members";
import { ColumnVisibility } from "../table/column-visibility";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";
import { membersColumns } from "../table/members-columns";
import { Percentage } from "./percentage";
import { PeriodFormatter } from "./period-formatter";

export const ActiveMembers = () => {
  const [{ from, to }] = useQueryStates(dateParams);

  const { data, isLoading } = trpc.dashboard.activeMembers.useQuery({
    from,
    to,
  });

  const { current, previous, variation } = data ?? {
    current: 0,
    previous: 0,
    variation: 0,
  };

  return (
    <div className="mb-0.5 flex flex-col overflow-hidden rounded-md border shadow-sm">
      <div className="flex h-[48px] items-center justify-between bg-sidebar p-3">
        <div className="flex items-center gap-2">
          <p className="font-medium text-lg">Active members</p>
          <TooltipInfo content="Members who have been active in the selected period." />
        </div>
        <ActiveMembersSheet count={current} loading={isLoading} />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className="font-bold text-4xl">{current}</p>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Percentage variation={variation} isLoading={isLoading} />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {previous} active member{previous > 1 ? "s" : ""} in the previous
              period
            </p>
          </TooltipContent>
        </Tooltip>
        <PeriodFormatter />
      </div>
    </div>
  );
};

const ActiveMembersSheet = ({
  count,
  loading,
}: {
  count: number;
  loading: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [{ from, to }] = useQueryStates(dateParams);
  const [{ search, idMember, descMember, page, pageSize }, setParams] =
    useQueryStates(tableParams);

  const { data, isLoading } = trpc.dashboard.activeMembersTable.useQuery(
    {
      from,
      to,
      search,
      id: idMember,
      desc: descMember,
      page,
      pageSize,
    },
    { enabled: open },
  );

  const { table } = useTable({
    data: data ?? [],
    columns: membersColumns,
    count: count ?? 0,
    left: ["full_name"],
    id: idMember,
    desc: descMember,
    type: "members",
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={loading}
          onClick={() => {
            table.setPageIndex(0);
            setParams({ page: 0 });
          }}
        >
          <PanelRight size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-[90vw] flex-col sm:max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>Active members</SheetTitle>
          <SheetDescription>
            Members who have been active in the selected period.
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col divide-y overflow-hidden rounded-md border">
          <div className="flex h-12 shrink-0 items-center gap-2 px-3">
            <QueryInput
              placeholder="Search..."
              query={search}
              setQuery={(value) => setParams({ search: value })}
            />
            <div className="ml-auto flex items-center gap-2">
              <ExportListMembers members={data} />
              <ColumnVisibility table={table} type="members" />
            </div>
          </div>
          <DataTable table={table} isLoading={isLoading} count={count ?? 0} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
