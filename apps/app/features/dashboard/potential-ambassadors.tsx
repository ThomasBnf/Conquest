"use client";

import { listPotentialAmbassadors } from "@/client/dashboard/listPotentialAmbassadors";
import { listTags } from "@/client/tags/listTags";
import { QueryInput } from "@/components/custom/query-input";
import { Members } from "@/components/icons/Members";
import { EmptyState } from "@/components/states/empty-state";
import { useUser } from "@/context/userContext";
import { useIsClient } from "@/hooks/useIsClient";
import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
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
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { FilterButton } from "../filters/filter-button";
import { FiltersList } from "../filters/filters-list";
import { Columns } from "../members/components/table/columns";
import { useScrollX } from "../table/hooks/useScrollX";
import { useHasScrollY } from "../table/hooks/usehasScrollY";
import { Pagination } from "../table/pagination";
import { TableSkeleton } from "../table/table-skeletton";

type Props = {
  from: Date;
  to: Date;
};

export const PotentialAmbassadors = ({ from, to }: Props) => {
  const { slug } = useUser();
  const { tags } = listTags();
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState<Filter[]>([]);

  const { members, count, isLoading } = listPotentialAmbassadors({
    from,
    to,
    filters,
  });

  const isClient = useIsClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollX = useScrollX({ isClient, id: "members-table" });
  const hasScrollY = useHasScrollY({ isClient, id: "members-table" });

  const columns = Columns({ tags });
  const fixedColumn = columns.slice(0, 2);
  const scrollableColumns = columns.slice(2);

  const [{ search }, setParams] = useQueryStates(tableParsers);

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
            Contributors members showing strong engagement in the selected
            period
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden rounded border">
          <div className="flex items-center gap-2 px-4 py-2">
            <QueryInput
              query={search}
              setQuery={(value) => setParams({ search: value, page: 1 })}
              placeholder="Search in members..."
            />
            {filters.length > 0 ? (
              <FiltersList
                filters={filters}
                setFilters={setFilters}
                align="start"
              />
            ) : (
              <FilterButton filters={filters} setFilters={setFilters} />
            )}
          </div>
          <Separator />
          <div className="relative flex-1 overflow-hidden">
            <ScrollArea
              id="members-table"
              className="h-full overflow-hidden"
              ref={scrollRef}
            >
              <div className="sticky top-0 z-30 flex">
                <div
                  className={cn("sticky left-0 z-10 flex border-r border-b")}
                  style={{ width: fixedColumn[1]?.width }}
                >
                  {fixedColumn[1]?.header({})}
                  {scrollX > 0 && (
                    <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                  )}
                </div>
                <div className="flex divide-x border-b">
                  {scrollableColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center"
                      style={{ width: column.width }}
                    >
                      {column.header({})}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                {isLoading ? (
                  <TableSkeleton isMembers />
                ) : (
                  members?.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "[&:not(:last-child)]:border-b",
                        !hasScrollY && "border-b",
                      )}
                    >
                      <div className="flex">
                        <div
                          className="sticky left-0 flex items-center border-r bg-background px-2"
                          style={{ width: fixedColumn[1]?.width }}
                        >
                          {fixedColumn[1]?.cell({
                            slug,
                            member,
                          })}
                          {scrollX > 0 && (
                            <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                          )}
                        </div>
                        <div className="flex divide-x">
                          {scrollableColumns.map((column) => (
                            <div
                              key={column.id}
                              style={{ width: column.width }}
                              className="flex items-center"
                            >
                              {column.cell({ member })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!isLoading && members?.length === 0 && (
                <EmptyState
                  icon={<Members size={36} />}
                  title={search ? "No members found" : "No at-risk members"}
                  description={
                    search
                      ? "None of your members match the current filters"
                      : "At-risk members will be shown here"
                  }
                  className={
                    open ? "max-w-[calc(100vw-14rem)]" : "max-w-[100vw]"
                  }
                >
                  {search && (
                    <Button onClick={() => setParams({ search: "" })}>
                      Clear filters
                    </Button>
                  )}
                </EmptyState>
              )}
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
          <Separator />
          <Pagination count={count ?? 0} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
