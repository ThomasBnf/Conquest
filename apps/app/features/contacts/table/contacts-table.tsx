"use client";

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
import type { Tag } from "@conquest/zod/tag.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { listContacts } from "actions/contacts/listContacts";
import { QueryInput } from "components/custom/query-input";
import { IsLoading } from "components/states/is-loading";
import { AddContact } from "features/contacts/add-contact";
import { Columns } from "features/contacts/table/columns";
import { useParamsContacts } from "hooks/useParamsContacts";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { BottomMenuAction } from "./bottom-menu-action";
import { ContactWithActivitiesSchema } from "@conquest/zod/activity.schema";

type Props = {
  tags: Tag[] | undefined;
  contactsCount: number;
};

export const ContactsTable = ({ tags, contactsCount }: Props) => {
  const { ref, inView } = useInView();
  const columns = useMemo(() => Columns({ tags }), [tags]);

  const [sorting, setSorting] = useState([{ id: "last_name", desc: false }]);
  const [rowSelection, setRowSelection] = useState({});
  const [{ search, id, desc }, setSearchParams] = useParamsContacts();
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["contacts", debouncedSearch, id, desc],
    queryFn: ({ pageParam }) =>
      listContacts({ page: pageParam, search: debouncedSearch, id, desc }),
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return ContactWithActivitiesSchema.array().parse(
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
            <p className="text-base font-medium">Contacts</p>
            <p className="rounded border bg-muted p-1 font-mono leading-none shadow-sm">
              {contactsCount}
            </p>
          </div>
          <AddContact />
        </div>
        <div className="flex py-2 px-4 ">
          <QueryInput
            query={search}
            setQuery={(value) => setSearchParams({ search: value })}
            placeholder="Search in contacts..."
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
      {table.getSelectedRowModel().rows.length > 0 && (
        <BottomMenuAction table={table} />
      )}
    </div>
  );
};
