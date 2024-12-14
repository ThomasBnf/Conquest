"use client";

import { updateWorkspace } from "@/actions/workspaces/updateWorkspace";
import { QueryInput } from "@/components/custom/query-input";
import { Members } from "@/components/icons/Members";
import { useUser } from "@/context/userContext";
import { FilterButton } from "@/features/filters/filter-button";
import { FiltersList } from "@/features/filters/filters-list";
import { ActionMenu } from "@/features/table/action-menu";
import { useScrollX } from "@/features/table/hooks/useScrollX";
import { useHasScrollY } from "@/features/table/hooks/usehasScrollY";
import { Pagination } from "@/features/table/pagination";
import { TableSkeleton } from "@/features/table/table-skeletton";
import { useIsClient } from "@/hooks/useIsClient";
import { tableParsers } from "@/lib/searchParamsTable";
import { useListMembers } from "@/queries/hooks/useListMembers";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { useSidebar } from "@conquest/ui/sidebar";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { Columns } from "./columns";

type Props = {
  count: number;
  tags: Tag[] | undefined;
};

export const MembersTable = ({ count, tags }: Props) => {
  const { members_preferences } = useUser();
  const { open } = useSidebar();
  const [{ search, id, desc, pageSize }, setParams] =
    useQueryStates(tableParsers);
  const [rowSelected, setRowSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>(
    members_preferences?.filters || [],
  );

  const { data: members, isLoading } = useListMembers({ filters });

  const isClient = useIsClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollX = useScrollX({ isClient });
  const hasScrollY = useHasScrollY({ dependencies: [isClient, members] });

  const columns = Columns({ tags });
  const fixedColumn = columns.slice(0, 2);
  const scrollableColumns = columns.slice(2);

  const handleUpdate = async (filters: Filter[]) => {
    await updateWorkspace({
      members_preferences: {
        id,
        desc,
        pageSize,
        filters,
      },
    });
  };

  return (
    <>
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
            handleUpdate={handleUpdate}
            align="start"
          />
        ) : (
          <FilterButton
            filters={filters}
            setFilters={setFilters}
            handleUpdate={handleUpdate}
          />
        )}
      </div>
      <div className="relative h-full overflow-hidden">
        <ScrollArea className="h-full overflow-hidden" ref={scrollRef}>
          <div className="sticky top-0 z-30 flex">
            <div
              className={cn(
                "sticky left-0 z-10 shrink-0 border-b [&:not(:first-child)]:border-r",
              )}
              style={{ width: fixedColumn[0]?.width }}
            >
              <div className="flex items-center">
                {fixedColumn[0]?.header({
                  members,
                  rowSelected,
                  setRowSelected,
                })}
              </div>
            </div>
            <div
              className={cn("sticky left-[40px] z-10 flex border-r border-b")}
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
          <div className="relative flex-grow">
            {isLoading ? (
              <TableSkeleton isMembers />
            ) : (
              members?.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "[&:not(:last-child)]:border-b",
                    rowSelected.includes(member.id) && "bg-muted",
                    !hasScrollY && "border-b",
                  )}
                >
                  <div className="flex">
                    <div
                      className={cn(
                        "sticky left-0 flex items-center justify-center [&:not(:first-child)]:border-r",
                        rowSelected.includes(member.id)
                          ? "bg-muted"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[0]?.width }}
                    >
                      {fixedColumn[0]?.cell({
                        member,
                        rowSelected,
                        setRowSelected,
                      })}
                      {scrollX > 0 && (
                        <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "sticky left-[40px] flex items-center border-r",
                        rowSelected.includes(member.id)
                          ? "bg-muted"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[1]?.width }}
                    >
                      {fixedColumn[1]?.cell({
                        member,
                        rowSelected,
                        setRowSelected,
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
            <div
              className={cn(
                "absolute top-36 mx-auto flex w-full flex-col items-center justify-center",
                open ? "max-w-[calc(100vw-14rem)]" : "max-w-[100vw]",
              )}
            >
              <div className="flex items-center justify-center">
                <Members />
              </div>
              <p className="text-center font-medium text-lg">
                No members found
              </p>
              <p className="mb-4 text-center text-muted-foreground">
                {search
                  ? "None of your members match the current filters"
                  : "No members found in your workspace"}
              </p>
              {search && (
                <Button onClick={() => setParams({ search: "" })}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
          {rowSelected.length > 0 && (
            <ActionMenu
              rowSelected={rowSelected}
              setRowSelected={setRowSelected}
            />
          )}
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      <Pagination count={count} />
    </>
  );
};
