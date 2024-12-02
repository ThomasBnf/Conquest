"use client";

import { Members } from "@/components/icons/Members";
import { IsLoading } from "@/components/states/is-loading";
import { Columns } from "@/features/leaderbord/components/columns";
import { useScrollX } from "@/features/table/hooks/useScrollX";
import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { useSidebar } from "@conquest/ui/sidebar";
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
    <div className="relative h-full overflow-hidden">
      <ScrollArea className="h-full overflow-hidden" ref={scrollRef}>
        <div className="sticky top-0 z-30 flex">
          <div
            className="sticky left-0 z-10 border-r border-b"
            style={{ width: fixedColumn?.width }}
          >
            <div className="flex h-12 items-center">
              {fixedColumn?.header({ members })}
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
        <div className="relative">
          {members?.map((member, index) => (
            <div key={member.id} className="border-b">
              <div className="flex">
                <div
                  className="sticky left-0 border-r bg-background"
                  style={{ width: fixedColumn?.width }}
                >
                  <div className="flex h-12 items-center">
                    {fixedColumn?.cell({ member })}
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
              {!isLoading && members.length - 20 === index && <div ref={ref} />}
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
            <p className="text-center font-medium text-lg">No members found</p>
            <p className="text-center text-muted-foreground">
              No more members has activity in this period
            </p>
          </div>
        )}
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
