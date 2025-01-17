"use client";

import { listAtRiskMembers } from "@/client/dashboard/listAtRiskMembers";
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
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { MembersTable } from "../table/members-table";

type Props = {
  from: Date;
  to: Date;
};

export const AtRiskMembers = ({ from, to }: Props) => {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState<Filter[]>([]);

  const { members, count, isLoading } = listAtRiskMembers({
    from,
    to,
    filters,
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
              <div className=" rounded-md border border-red-200 bg-red-100 p-2">
                <AlertTriangle className="size-4 text-red-500" />
              </div>
              <p className="mt-4 text-muted-foreground">At Risk Members</p>
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
            <p>Click to view at-risk members</p>
          </TooltipContent>
        </Tooltip>
      </SheetTrigger>
      <SheetContent className="flex h-full w-[90vw] flex-col overflow-hidden sm:max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>At Risk Members</SheetTitle>
          <SheetDescription>
            Active members with no activities in the selected period.
          </SheetDescription>
        </SheetHeader>
        <MembersTable
          members={members}
          isLoading={isLoading}
          count={count}
          filters={filters}
          setFilters={setFilters}
          emptyDescription="No at-risk members found"
          className="rounded-md border"
        />
      </SheetContent>
    </Sheet>
  );
};
