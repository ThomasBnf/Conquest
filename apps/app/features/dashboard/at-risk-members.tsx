"use client";

import { TooltipInfo } from "@/components/badges/tooltip-info";
import { QueryInput } from "@/components/custom/query-input";
import { useTable } from "@/hooks/useTable";
import { trpc } from "@/server/client";
import { dateParams } from "@/utils/dateParams";
import { tableMembersParams } from "@/utils/tableParams";
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
import { skipToken } from "@tanstack/react-query";
import { PanelRight, TriangleAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { ExportListMembers } from "../members/export-list-members";
import { membersColumns } from "../table/columns/members-columns";
import { DataTable } from "../table/data-table";
import { ColumnSettings } from "../table/settings/columnSettings";
import { Percentage } from "./percentage";
import { PeriodFormatter } from "./period-formatter";

export const AtRiskMembers = () => {
  const [{ from, to }] = useQueryStates(dateParams);

  const { data, isLoading } = trpc.dashboard.atRiskMembers.useQuery({
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
          <div className="flex size-6 items-center justify-center rounded-md border border-red-200 bg-red-100">
            <TriangleAlert className="size-4 text-red-500" />
          </div>
          <p className="font-medium text-base">At risk members</p>
          <TooltipInfo
            content="Active members (above level 3) with no activity in the
            selected period."
          />
        </div>
        <AtRiskMembersSheet count={current} loading={isLoading} />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className="font-bold text-4xl">{current}</p>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Percentage variation={variation} isLoading={isLoading} inverse />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {previous} at risk member{previous > 1 ? "s" : ""} in the previous
              period
            </p>
          </TooltipContent>
        </Tooltip>
        <PeriodFormatter />
      </div>
    </div>
  );
};

const AtRiskMembersSheet = ({
  count,
  loading,
}: {
  count: number;
  loading: boolean;
}) => {
  const { data: session } = useSession();
  const { user } = session ?? {};
  const [open, setOpen] = useState(false);
  const [{ from, to }] = useQueryStates(dateParams);
  const columns = membersColumns();

  const params = useQueryStates(tableMembersParams);
  const [{ search, id, desc }, setParams] = params;

  const { data, isLoading, fetchNextPage } =
    trpc.dashboard.atRiskMembersTable.useInfiniteQuery(
      open ? { from, to, search, id, desc } : skipToken,
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

  const members = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  const table = useTable({
    columns,
    data: members ?? [],
    fetchNextPage,
    hasNextPage,
    isLoading,
    count,
    preferences: user?.membersPreferences,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" disabled={loading}>
          <PanelRight size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-[90vw] flex-col sm:max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>At risk members</SheetTitle>
          <SheetDescription>
            Active members (min level 4) who have not been active in the
            selected period.
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
              <ExportListMembers members={members} />
              <ColumnSettings table={table} />
            </div>
          </div>
          <DataTable table={table} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
