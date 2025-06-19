"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { tableMembersParams } from "@/utils/tableParams";
import { Button } from "@conquest/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@conquest/ui/sheet";
import { PanelRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { membersColumns } from "../table/columns/members-columns";

export const PotentialAmbassadors = () => {
  const { globalDateRange } = useDateRange();
  const [dateRange, setDateRange] = useState(globalDateRange);

  // const { data, isLoading } = trpc.dashboard.potentialAmbassadors.useQuery({
  //   dateRange,
  // });

  // const { current, previous, variation } = data ?? {
  //   current: 0,
  //   previous: 0,
  //   variation: 0,
  // };

  // useEffect(() => {
  //   setDateRange(globalDateRange);
  // }, [globalDateRange]);

  return (
    <div className="flex flex-col gap-6 rounded-md border p-4 shadow-sm">
      {/* <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="flex justify-center items-center p-1 bg-green-100 rounded border border-green-200">
            <Megaphone size={16} className="text-green-500" />
          </div>
          <p className="text-lg font-medium">Potential ambassadors</p>
          <TooltipInfo content="Contributor members (min pulse score 150 and max 199) with activities in the selected period." />
        </div>
        <div className="flex gap-2 items-center">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          <PotentialAmbassadorsSheet count={current} loading={isLoading} />
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-2 justify-center items-center py-8">
        {isLoading ? (
          <Skeleton className="w-16 h-10" />
        ) : (
          <p className="text-4xl font-bold">{current}</p>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Percentage variation={variation} isLoading={isLoading} />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {previous} potential ambassador{previous > 1 ? "s" : ""} in the
              previous period
            </p>
          </TooltipContent>
        </Tooltip>
        <PeriodFormatter />
      </div> */}
    </div>
  );
};

const PotentialAmbassadorsSheet = ({
  count,
  loading,
}: {
  count: number;
  loading: boolean;
}) => {
  const { globalDateRange } = useDateRange();
  const [dateRange, setDateRange] = useState(globalDateRange);

  const { data: session } = useSession();
  const { user } = session ?? {};
  const [open, setOpen] = useState(false);
  const columns = membersColumns();

  const params = useQueryStates(tableMembersParams);
  const [{ search, id, desc }, setParams] = params;

  // const { data, isLoading, fetchNextPage } =
  //   trpc.dashboard.potentialAmbassadorsTable.useInfiniteQuery(
  //     open ? { dateRange, search, id, desc } : skipToken,
  //     { getNextPageParam: (_, allPages) => allPages.length * 25 },
  //   );

  // const members = data?.pages.flat();
  // const hasNextPage = data?.pages.at(-1)?.length === 25;

  // const table = useTable({
  //   columns,
  //   data: members ?? [],
  //   fetchNextPage,
  //   hasNextPage,
  //   isLoading,
  //   count,
  //   preferences: user?.membersPreferences,
  // });

  useEffect(() => {
    setDateRange(globalDateRange);
  }, [globalDateRange]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" disabled={loading}>
          <PanelRight size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-[90vw] flex-col sm:max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>Potential ambassadors</SheetTitle>
          <SheetDescription>
            Contributor members (min pulse score 150 and max 199) with
            activities in the period.
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col divide-y overflow-hidden rounded-md border">
          {/* <div className="flex gap-2 items-center px-3 h-12 shrink-0">
            <QueryInput
              placeholder="Search..."
              query={search}
              setQuery={(value) => setParams({ search: value })}
            />
            <div className="flex gap-2 items-center ml-auto">
              <ExportListMembers members={members} />
              <ColumnSettings table={table} />
            </div>
          </div>
          <DataTable table={table} /> */}
        </div>
      </SheetContent>
    </Sheet>
  );
};
