"use client";

import { QueryInput } from "@/components/custom/query-input";
import { Members } from "@/components/icons/Members";
import { ActionMenu } from "@/features/table/action-menu";
import { useScrollX } from "@/features/table/hooks/useScrollX";
import { useHasScrollY } from "@/features/table/hooks/usehasScrollY";
import { Pagination } from "@/features/table/pagination";
import { TableSkeleton } from "@/features/table/table-skeletton";
import { useIsClient } from "@/hooks/useIsClient";
import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/src/components/button";
import { ScrollArea, ScrollBar } from "@conquest/ui/src/components/scroll-area";
import { useSidebar } from "@conquest/ui/src/components/sidebar";
import { cn } from "@conquest/ui/src/utils/cn";
import type { MemberWithCompany } from "@conquest/zod/member.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { Columns } from "./columns";

type Props = {
  count: number;
  tags: Tag[] | undefined;
  members: MemberWithCompany[] | undefined;
};

export const MembersTable = ({ count, tags, members }: Props) => {
  const { open } = useSidebar();
  const [{ search }, setParams] = useQueryStates(tableParsers);
  const [rowSelected, setRowSelected] = useState<string[]>([]);

  const isClient = useIsClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollX = useScrollX({ isClient });
  const hasScrollY = useHasScrollY({ dependencies: [isClient, members] });

  const columns = Columns({ tags });
  const fixedColumn = columns.slice(0, 2);
  const scrollableColumns = columns.slice(2);

  return (
    <>
      <div className="flex min-h-12 items-center border-b px-4">
        <QueryInput
          query={search}
          setQuery={(value) => setParams({ search: value })}
          placeholder="Search in members..."
        />
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
              <div className="flex h-12 items-center">
                {fixedColumn[0]?.header({
                  members,
                  rowSelected,
                  setRowSelected,
                })}
              </div>
              {scrollX > 0 && (
                <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
              )}
            </div>
            <div
              className={cn(
                "sticky left-[40px] z-10 shrink-0 border-r border-b",
              )}
              style={{ width: fixedColumn[1]?.width }}
            >
              <div className="flex h-12 items-center">
                {fixedColumn[1]?.header({})}
              </div>
              {scrollX > 0 && (
                <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
              )}
            </div>
            <div className="flex divide-x border-b">
              {scrollableColumns.map((column) => (
                <div
                  key={column.id}
                  className="flex h-12 items-center"
                  style={{ width: column.width }}
                >
                  {column.header({})}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex-grow">
            {isClient ? (
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
                        "sticky left-0 [&:not(:first-child)]:border-r",
                        rowSelected.includes(member.id)
                          ? "bg-muted"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[0]?.width }}
                    >
                      <div className="flex h-12 items-center">
                        {fixedColumn[0]?.cell({
                          member,
                          rowSelected,
                          setRowSelected,
                        })}
                      </div>
                      {scrollX > 0 && (
                        <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "sticky left-[40px] border-r",
                        rowSelected.includes(member.id)
                          ? "bg-muted"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[1]?.width }}
                    >
                      <div className="flex h-12 items-center">
                        {fixedColumn[1]?.cell({
                          member,
                          rowSelected,
                          setRowSelected,
                        })}
                      </div>
                      {scrollX > 0 && (
                        <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                      )}
                    </div>
                    <div className="flex divide-x">
                      {scrollableColumns.map((column) => (
                        <div
                          key={column.id}
                          className="flex h-12 items-center"
                          style={{ width: column.width }}
                        >
                          {column.cell({ member })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <TableSkeleton isMembers />
            )}
          </div>
          {isClient && members?.length === 0 && (
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
              count={count}
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
