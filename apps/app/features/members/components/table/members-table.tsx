"use client";

import { IsLoading } from "@/components/states/is-loading";
import { ActionMenu } from "@/features/table/action-menu";

import { QueryInput } from "@/components/custom/query-input";
import { Members } from "@/components/icons/Members";
import { useScrollX } from "@/features/table/hooks/useScrollX";
import { useHasScrollY } from "@/features/table/hooks/usehasScrollY";
import { useIsClient } from "@/hooks/useIsClient";
import { useParamsMembers } from "@/hooks/useParamsMembers";
import { Button } from "@conquest/ui/button";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { useSidebar } from "@conquest/ui/sidebar";
import { cn } from "@conquest/ui/utils/cn";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { useListMembers } from "../../hooks/useListMembers";
import { Columns } from "./columns";

type Props = {
  initialMembers: MemberWithActivities[] | undefined;
  count: number;
  tags: Tag[] | undefined;
};

export const MembersTable = ({ initialMembers, count, tags }: Props) => {
  const { ref, inView } = useInView();
  const { open } = useSidebar();
  const [{ search, id, desc }, setSearchParams] = useParamsMembers();
  const [rowSelected, setRowSelected] = useState<string[]>([]);
  const [debouncedSearch] = useDebounce(search, 500);

  const { members, isLoading, fetchNextPage, hasNextPage } = useListMembers({
    initialMembers,
    debouncedSearch,
    id,
    desc,
  });

  const isClient = useIsClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollX = useScrollX({ isClient });
  const hasScrollY = useHasScrollY({ dependencies: [isClient, members] });

  const columns = Columns({ tags });
  const fixedColumn = columns.slice(0, 2);
  const scrollableColumns = columns.slice(2);

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  if (!isClient) return <IsLoading />;

  return (
    <>
      <div className="flex items-center border-b px-4 min-h-12">
        <QueryInput
          query={search}
          setQuery={(value) => setSearchParams({ search: value })}
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
                <div className="absolute right-0 top-0 h-full w-12 -mr-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
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
                <div className="absolute right-0 top-0 h-full w-12 -mr-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
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
            {members?.map((member, index) => (
              <div
                key={member.id}
                className={cn(
                  "[&:not(:last-child)]:border-b",
                  rowSelected.includes(member.id) && "bg-muted",
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
                      <div className="absolute right-0 top-0 h-full w-12 -mr-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
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
                      <div className="absolute right-0 top-0 h-full w-12 -mr-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
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
                {!isLoading && members.length - 20 === index && (
                  <div ref={ref} />
                )}
              </div>
            ))}
          </div>
          {members.length === 0 && (
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
                {debouncedSearch
                  ? "None of your members match the current filters"
                  : "No members found in your workspace"}
              </p>
              {debouncedSearch && (
                <Button onClick={() => setSearchParams({ search: "" })}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
          <div
            className={cn(
              "flex bg-background",
              members.length > 0 ? "border-t" : "border-b",
              hasScrollY ? "sticky bottom-0" : "border-b",
            )}
          >
            <div
              className="sticky left-0 border-r bg-background"
              style={{ width: 325 }}
            >
              <p
                className="flex h-12 items-center justify-end border-r px-3"
                style={{ width: 325 }}
              >
                <span className="mr-auto text-muted-foreground">Count</span>
                <span className="mx-1 font-mono">{members.length} /</span>
                <span className="font-mono text-muted-foreground">{count}</span>
              </p>
            </div>
          </div>
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
    </>
  );
};
