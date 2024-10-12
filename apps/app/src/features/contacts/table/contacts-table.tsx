"use client";

import { listContacts } from "@/actions/contacts/listContacts";
import { QueryInput } from "@/components/custom/query-input";
import { Loading } from "@/components/states/Loading";
import { useUser } from "@/context/userContext";
import { AddContact } from "@/features/contacts/add-contact";
import { Columns } from "@/features/contacts/table/columns";
import { useParamsContacts } from "@/hooks/useParamsContacts";
import { ContactWithActivitiesSchema } from "@/schemas/activity.schema";
import type { Tag } from "@/schemas/tag.schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@conquest/ui/table";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
  tags: Tag[] | undefined;
  contactsCount: number;
};

export const ContactsTable = ({ tags, contactsCount }: Props) => {
  const { slug } = useUser();
  const { ref, inView } = useInView();

  const [{ search, id, desc }, setSearchParams] = useParamsContacts();
  const [sorting, setSorting] = useState([{ id: "last_name", desc: false }]);

  const router = useRouter();
  const columns = useMemo(() => Columns({ tags }), [tags]);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["contacts", search, id, desc],
    queryFn: ({ pageParam }) =>
      listContacts({ page: pageParam, search, id, desc }),
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: (value) => setSearchParams({ search: value }),
    state: {
      sorting,
      globalFilter: search,
    },
    globalFilterFn: (row, _, filterValue) =>
      row.original.search.includes(filterValue.toLowerCase()),
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="flex h-full flex-col divide-y">
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
          <Loading />
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
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => {
                      router.push(
                        `/${slug}/contacts/${row.original.id}?from=contacts`,
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
            <TableRow>
              <div ref={ref} />
            </TableRow>
          </Table>
        )}
      </div>
    </div>
  );
};
