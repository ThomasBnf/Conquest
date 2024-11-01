"use client";

import { QueryInput } from "@/components/custom/query-input";
import { IsLoading } from "@/components/states/is-loading";
import { Columns } from "@/features/members/components/columns";
import { useParamsMembers } from "@/hooks/useParamsMembers";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
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
import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ky from "ky";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { ActionMenu } from "./action-menu";

type Props = {
  tags: Tag[] | undefined;
};

export const MembersTable = ({ tags }: Props) => {
  const { ref, inView } = useInView();
  const columns = useMemo(() => Columns({ tags }), [tags]);

  const [{ search, id, desc }, setSearchParams] = useParamsMembers();
  const [sorting, setSorting] = useState([{ id, desc }]);
  const [rowSelection, setRowSelection] = useState({});
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["members", debouncedSearch, id, desc, sorting],
    queryFn: async ({ pageParam }) => {
      return await ky
        .get("/api/members", {
          searchParams: {
            page: pageParam,
            search: debouncedSearch,
            id,
            desc,
          },
        })
        .json<MemberWithActivities[]>();
    },
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const members = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return MemberWithActivitiesSchema.array().parse(pages.flat());
  }, [data?.pages]);

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    enableRowSelection: true,
    state: { sorting, rowSelection },
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  return (
    <Fragment>
      <div className="px-4 min-h-12 flex items-center border-b">
        <QueryInput
          query={search}
          setQuery={(value) => setSearchParams({ search: value })}
          placeholder="Search in members..."
        />
      </div>
      <ScrollArea>
        <Table className="whitespace-nowrap">
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
                  className={cn(row.getIsSelected() && "bg-muted")}
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
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      {table.getSelectedRowModel().rows.length > 0 && (
        <ActionMenu table={table} />
      )}
    </Fragment>
  );
};
