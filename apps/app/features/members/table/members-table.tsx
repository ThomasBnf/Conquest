"use client";

import { useParamsMembers } from "@/hooks/useParamsMembers";
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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { listMembers } from "actions/members/listMembers";
import { QueryInput } from "components/custom/query-input";
import { IsLoading } from "components/states/is-loading";
import { Columns } from "features/members/table/columns";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { AddMember } from "../add-member";
import { BottomMenuAction } from "./bottom-menu-action";

type Props = {
  tags: Tag[] | undefined;
  membersCount: number;
};

export const MembersTable = ({ tags, membersCount }: Props) => {
  const { ref, inView } = useInView();
  const columns = useMemo(() => Columns({ tags }), [tags]);

  const [sorting, setSorting] = useState([{ id: "last_name", desc: false }]);
  const [rowSelection, setRowSelection] = useState({});
  const [{ search, id, desc }, setSearchParams] = useParamsMembers();
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["members", debouncedSearch, id, desc],
    queryFn: ({ pageParam }) =>
      listMembers({ page: pageParam, search: debouncedSearch, id, desc }),
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return MemberWithActivitiesSchema.array().parse(
      pages.flatMap((page) => page?.data),
    );
  }, [data?.pages]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="relative flex h-full flex-col divide-y">
      <div className="divide-y">
        <div className="flex items-center gap-2 py-2 px-4 justify-between">
          <div className="flex gap-2">
            <p className="text-base font-medium">Members</p>
            <p className="rounded border bg-muted p-1 font-mono leading-none shadow-sm">
              {membersCount}
            </p>
          </div>
          <AddMember />
        </div>
        <div className="flex py-2 px-4 ">
          <QueryInput
            query={search}
            setQuery={(value) => setSearchParams({ search: value })}
            placeholder="Search in members..."
          />
        </div>
      </div>
      <div className="relative overflow-auto">
        {isLoading ? (
          <IsLoading />
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-background">
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(row.getIsSelected() && "bg-neutral-100")}
                      >
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
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length} ref={ref} className="p-0" />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
      {table.getSelectedRowModel().rows.length > 0 && (
        <BottomMenuAction table={table} />
      )}
    </div>
  );
};
