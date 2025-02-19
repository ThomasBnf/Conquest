"use client";

import { QueryInput } from "@/components/custom/query-input";
import { useFilters } from "@/context/filtersContext";
import { tableParsers } from "@/lib/searchParamsTable";
import { trpc } from "@/server/client";
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
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { FiltersList } from "../filters/filters-list";
import { ExportListMembers } from "../lists/export-list-members";
import { ColumnVisibility } from "../table/column-visibility";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";
import { membersColumns } from "../table/members-columns";

type Props = {
  from: Date;
  to: Date;
};

export const PotentialAmbassadors = ({ from, to }: Props) => {
  const { groupFilters } = useFilters();
  const [open, setOpen] = useState(false);
  const [{ search, idMember, descMember, page, pageSize }, setParams] =
    useQueryStates(tableParsers);

  const { data, isLoading } = trpc.dashboard.potentialAmbassadors.useQuery({
    search,
    id: idMember,
    desc: descMember,
    page,
    pageSize,
    groupFilters,
    from,
    to,
  });

  const { members, count } = data ?? {};

  const { table } = useTable({
    data: members ?? [],
    columns: membersColumns,
    count: count ?? 0,
    left: ["full_name"],
    id: idMember,
    desc: descMember,
    type: "members",
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex-1" asChild>
        <Tooltip>
          <TooltipTrigger className="flex-1" asChild>
            <button
              type="button"
              className="flex flex-1 flex-col items-start rounded-md border p-6 transition-colors hover:bg-muted"
              onClick={() => setOpen(true)}
            >
              <div className=" rounded-md border border-green-200 bg-green-100 p-2">
                <InfoCircledIcon className="size-4 text-green-500" />
              </div>
              <p className="mt-4 text-muted-foreground">
                Potential Ambassadors
              </p>
              <div className="mt-1">
                {isLoading ? (
                  <Skeleton className="h-[30px] w-12" />
                ) : (
                  <p className="font-bold text-3xl leading-none">{count}</p>
                )}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view potential ambassadors</p>
          </TooltipContent>
        </Tooltip>
      </SheetTrigger>
      <SheetContent className="flex h-full w-[90vw] flex-col overflow-hidden sm:max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>Potential Ambassadors</SheetTitle>
          <SheetDescription>
            Contributors members with activities in the selected period.
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col divide-y overflow-hidden rounded-md border">
          <div className="flex h-12 shrink-0 items-center gap-2 px-4">
            <QueryInput
              placeholder="Search..."
              query={search}
              setQuery={(value) => setParams({ search: value })}
            />
            <FiltersList />
            <div className="ml-auto flex items-center gap-2">
              <ExportListMembers members={members} />
              <ColumnVisibility table={table} type="members" />
            </div>
          </div>
          <DataTable table={table} isLoading={isLoading} count={count ?? 0} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
