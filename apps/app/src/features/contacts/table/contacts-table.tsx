"use client";

import { listContacts } from "@/actions/contacts/listContacts";
import { QueryInput } from "@/components/custom/QueryInput";
import { Loading } from "@/components/states/Loading";
import { useUser } from "@/context/userContext";
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
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { AddContact } from "../add-contact";

type Props = {
  tags: Tag[] | undefined;
  contactsCount: number;
};

export const ContactsTable = ({ tags, contactsCount }: Props) => {
  const { slug } = useUser();
  const { ref, inView } = useInView();
  const router = useRouter();

  const [{ search, id, desc }, setSearchParams] = useParamsContacts();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "last_name", desc: false },
  ]);
  const [hasScroll, setHasScroll] = useState(false);

  const columns = useMemo(() => Columns({ tags }), [tags]);
  const container = useRef<HTMLDivElement>(null);
  const firstCell = useRef<HTMLTableCellElement>(null);

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
  }, [inView]);

  useEffect(() => {
    const checkScroll = () => {
      if (container.current) {
        setHasScroll(
          container.current.scrollHeight > container.current.clientHeight,
        );
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
    };
  }, [flatData]);

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex min-h-12 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <p className="font-medium">Contacts</p>
          <QueryInput
            query={search}
            setQuery={(value) => setSearchParams({ search: value })}
          />
        </div>
        <AddContact />
      </div>
      <div ref={container} className="relative overflow-auto">
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      ref={index === 0 ? firstCell : null}
                      className="bg-background"
                    >
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
              {!hasScroll && (
                <>
                  <TableRow className="border-b after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border hover:bg-transparent">
                    <TableCell>
                      <p className="flex justify-end space-x-1 text-end">
                        <span className="font-mono">
                          {search
                            ? table.getFilteredRowModel().rows.length
                            : contactsCount}
                        </span>
                        <span className="text-muted-foreground">count</span>
                      </p>
                    </TableCell>
                  </TableRow>
                  <div />
                </>
              )}
            </TableBody>
            <div ref={ref} />
          </Table>
        )}
      </div>
      {hasScroll && (
        <div className="flex h-[41px] shrink-0">
          <p
            className="flex items-center justify-end space-x-1 px-4 text-end"
            style={{ width: firstCell.current?.offsetWidth }}
          >
            <span className="font-mono">
              {search ? table.getFilteredRowModel().rows.length : contactsCount}
            </span>
            <span className="text-muted-foreground">count</span>
          </p>
          <div />
        </div>
      )}
    </div>
  );
};
