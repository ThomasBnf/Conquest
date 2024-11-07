"use client";

import { IsLoading } from "@/components/states/is-loading";
import { Columns } from "@/features/leaderbord/components/columns";
import { useScrollX } from "@/features/table/hooks/useScrollX";
import { useIsClient } from "@/hooks/useIsClient";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { useSidebar } from "@conquest/ui/sidebar";
import { cn } from "@conquest/ui/utils/cn";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useListLeaderboard } from "../hooks/useListLeaderboard";

type Props = {
  initialMembers: MemberWithActivities[] | undefined;
  tags: Tag[] | undefined;
  from: Date;
  to: Date;
};

export const LeaderbordTable = ({ initialMembers, tags, from, to }: Props) => {
  const { ref, inView } = useInView();
  const { open } = useSidebar();

  const isClient = useIsClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollX = useScrollX({ isClient });

  const columns = Columns({ tags });
  const fixedColumn = columns[0];
  const scrollableColumns = columns.slice(1);

  const { members, isLoading, fetchNextPage, hasNextPage } = useListLeaderboard(
    {
      initialMembers,
      from,
      to,
    },
  );

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  if (!isClient) return <IsLoading />;

  return (
    <div className="relative overflow-hidden h-full">
      <ScrollArea className="h-full overflow-hidden" ref={scrollRef}>
        <div className="sticky top-0 z-30 flex">
          <div
            className="sticky left-0 z-10 shrink-0 border-r border-b"
            style={{ width: fixedColumn?.width }}
          >
            <div className="h-12 flex items-center">
              {fixedColumn?.header({ members })}
            </div>
            {scrollX > 0 && (
              <div className="absolute right-0 -mr-12 top-0 h-full bg-gradient-to-r from-black opacity-[0.075] to-transparent w-12" />
            )}
          </div>
          <div className="flex border-b divide-x">
            {scrollableColumns.map((column) => (
              <div
                key={column.id}
                className="h-12 flex items-center"
                style={{ width: column.width }}
              >
                {column.header({})}
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex-grow">
          {members.length ? (
            members?.map((member, index) => (
              <div key={member.id} className="border-b">
                <div className="flex">
                  <div
                    className="sticky left-0 border-r bg-background"
                    style={{ width: fixedColumn?.width }}
                  >
                    <div className="h-12 flex items-center">
                      {fixedColumn?.cell({ member })}
                    </div>
                    {scrollX > 0 && (
                      <div className="absolute right-0 -mr-12 top-0 h-full bg-gradient-to-r from-black opacity-[0.075] to-transparent w-12" />
                    )}
                  </div>
                  <div className="flex divide-x">
                    {scrollableColumns.map((column) => (
                      <div
                        key={column.id}
                        className="h-12 flex items-center"
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
            ))
          ) : (
            <div
              className={cn(
                "mx-auto w-full absolute top-24",
                open ? "max-w-[calc(100vw-14rem)]" : "max-w-[100vw]",
              )}
            >
              <p className="text-center text-muted-foreground">
                No members found
              </p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
