"use client";

import { countCompanies } from "@/client/companies/countMembers";
import { listCompanies } from "@/client/companies/listCompanies";
import { QueryInput } from "@/components/custom/query-input";
import { Companies } from "@/components/icons/Companies";
import { EmptyState } from "@/components/states/empty-state";
import { useUser } from "@/context/userContext";
import { Pagination } from "@/features/table/pagination";
import { useIsClient } from "@/hooks/useIsClient";
import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { useSidebar } from "@conquest/ui/sidebar";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { ActionMenu } from "../table/action-menu";
import { useScrollX } from "../table/hooks/useScrollX";
import { useHasScrollY } from "../table/hooks/usehasScrollY";
import { TableSkeleton } from "../table/table-skeletton";
import { Columns } from "./columns";

type Props = {
  tags: Tag[] | undefined;
};

export const CompaniesTable = ({ tags }: Props) => {
  const { slug } = useUser();
  const { open } = useSidebar();
  const [rowSelected, setRowSelected] = useState<string[]>([]);

  const { companies, isLoading } = listCompanies();
  const { count } = countCompanies();

  const scrollRef = useRef<HTMLDivElement>(null);

  const isClient = useIsClient();
  const scrollX = useScrollX({ isClient, id: "companies-table" });
  const hasScrollY = useHasScrollY({ isClient, id: "companies-table" });

  const columns = Columns({ tags });
  const fixedColumn = columns.slice(0, 2);
  const scrollableColumns = columns.slice(2);

  const [{ search }, setParams] = useQueryStates(tableParsers);

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2">
        <QueryInput
          query={search}
          setQuery={(value) => setParams({ search: value, page: 1 })}
          placeholder="Search in companies..."
        />
      </div>
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea
          id="companies-table"
          className="h-full overflow-hidden"
          ref={scrollRef}
        >
          <div className="sticky top-0 z-30 flex">
            <div
              className={cn(
                "sticky left-0 z-10 shrink-0 border-b [&:not(:first-child)]:border-r",
              )}
              style={{ width: fixedColumn[0]?.width }}
            >
              <div className="flex items-center">
                {fixedColumn[0]?.header({
                  companies,
                  rowSelected,
                  setRowSelected,
                })}
              </div>
            </div>
            <div
              className={cn("sticky left-[40px] z-10 flex border-r border-b")}
              style={{ width: fixedColumn[1]?.width }}
            >
              {fixedColumn[1]?.header({})}
              {scrollX > 0 && (
                <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
              )}
            </div>
            <div className="flex divide-x border-b">
              {scrollableColumns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center"
                  style={{ width: column.width }}
                >
                  {column.header({})}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              companies?.map((company) => (
                <div
                  key={company.id}
                  className={cn(
                    "[&:not(:last-child)]:border-b",
                    rowSelected.includes(company.id) && "bg-muted",
                    !hasScrollY && "border-b",
                  )}
                >
                  <div className="flex">
                    <div
                      className={cn(
                        "sticky left-0 flex items-center justify-center [&:not(:first-child)]:border-r",
                        rowSelected.includes(company.id)
                          ? "bg-muted-hover"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[0]?.width }}
                    >
                      {fixedColumn[0]?.cell({
                        company,
                        rowSelected,
                        setRowSelected,
                      })}
                      {scrollX > 0 && (
                        <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "sticky left-[40px] flex items-center border-r",
                        rowSelected.includes(company.id)
                          ? "bg-muted-hover"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[1]?.width }}
                    >
                      {fixedColumn[1]?.cell({
                        slug,
                        company,
                        rowSelected,
                        setRowSelected,
                      })}
                      {scrollX > 0 && (
                        <div className="-mr-12 absolute top-0 right-0 h-full w-12 bg-gradient-to-r from-black to-transparent opacity-[0.075]" />
                      )}
                    </div>
                    <div className="flex divide-x">
                      {scrollableColumns.map((column) => (
                        <div
                          key={column.id}
                          style={{ width: column.width }}
                          className="flex items-center"
                        >
                          {column.cell({ company })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {!isLoading && companies?.length === 0 && (
            <EmptyState
              icon={<Companies size={36} />}
              title="No companies found"
              description={
                search
                  ? "None of your companies match the current filters"
                  : "No companies found in your workspace"
              }
              className={open ? "max-w-[calc(100vw-14rem)]" : "max-w-[100vw]"}
            >
              {search && (
                <Button onClick={() => setParams({ search: "" })}>
                  Clear filters
                </Button>
              )}
            </EmptyState>
          )}
          {rowSelected.length > 0 && (
            <ActionMenu
              rowSelected={rowSelected}
              setRowSelected={setRowSelected}
              table="companies"
            />
          )}
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      <Pagination count={count ?? 0} />
    </>
  );
};
