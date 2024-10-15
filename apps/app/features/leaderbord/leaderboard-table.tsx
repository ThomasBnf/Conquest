"use client";

import { listLeaderboard } from "@/actions/contacts/listLeaderboard";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@conquest/ui/table";
import { ContactWithActivitiesSchema } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IsLoading } from "components/states/is-loading";
import { useUser } from "context/userContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
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
    queryFn: ({ pageParam }) => listLeaderboard({ page: pageParam, from, to }),
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 0,
  });

  const flatData = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return ContactWithActivitiesSchema.array().parse(
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

  if (flatData.length === 0) return;

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <IsLoading />
        ) : (
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => {
                      router.push(
                        `/${slug}/contacts/${row.original.id}?from=leaderboard`,
                      );
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length} ref={ref} className="p-0" />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  );
};
