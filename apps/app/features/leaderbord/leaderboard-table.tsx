"use client";

import { IsLoading } from "@/components/states/is-loading";
import { ScrollArea } from "@conquest/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@conquest/ui/table";
import { cn } from "@conquest/ui/utils/cn";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useUser } from "context/userContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { listLeaderboardActions } from "./actions/listLeaderboardActions";
import { Columns } from "./columns";

type Props = {
  tags: Tag[] | undefined;
  from: Date;
  to: Date;
};

export const LeaderbordTable = ({ tags, from, to }: Props) => {
  const { slug } = useUser();
  const { ref, inView } = useInView();
  const router = useRouter();
  const columns = Columns(tags);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["leaderboard", from, to],
    queryFn: ({ pageParam }) =>
      listLeaderboardActions({ page: pageParam, from, to }),
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return MemberWithActivitiesSchema.array().parse(
      pages.flatMap((page) => page?.data ?? []).slice(3),
    );
  }, [data?.pages]);

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  return (
    <ScrollArea>
      <Table>
        <TableHeader className="sticky top-0 z-10 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <IsLoading />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => {
                  router.push(
                    `/${slug}/members/${row.original.id}?from=leaderboard`,
                  );
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className={cn(isLoading && "border-t-0")}>
          <TableRow>
            <TableCell colSpan={columns.length} ref={ref} className="p-0" />
          </TableRow>
        </TableFooter>
      </Table>
    </ScrollArea>
  );
};
