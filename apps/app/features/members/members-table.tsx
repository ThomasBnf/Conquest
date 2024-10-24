"use client";

import { QueryInput } from "@/components/custom/query-input";
import { IsLoading } from "@/components/states/is-loading";
import { Columns } from "@/features/members/columns";
import { useParamsMembers } from "@/hooks/useParamsMembers";
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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { ActionMenu } from "./action-menu";
import { listMembersAction } from "./actions/listMembersAction";

type Props = {
  tags: Tag[] | undefined;
};

export const MembersTable = ({ tags }: Props) => {
  const { ref, inView } = useInView();
  const columns = useMemo(() => Columns({ tags }), [tags]);

  const [{ search, id, desc }, setSearchParams] = useParamsMembers();
  const [sorting, setSorting] = useState([
    { id: id ?? "last_name", desc: desc ?? false },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["members", debouncedSearch, id, desc, sorting],
    queryFn: ({ pageParam }) =>
      listMembersAction({
        page: pageParam,
        search: debouncedSearch,
        id,
        desc,
      }),
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const members = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return MemberWithActivitiesSchema.array().parse(
      pages.flatMap((page) => page?.data ?? []),
    );
  }, [data?.pages]);

  const table = useReactTable({
    data: members,
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <IsLoading />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
          <TableFooter className={cn(isLoading && "border-t-0")}>
            <TableRow>
              <TableCell colSpan={columns.length} ref={ref} className="p-0" />
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
      {table.getSelectedRowModel().rows.length > 0 && (
        <ActionMenu table={table} />
      )}
    </Fragment>
  );
};
