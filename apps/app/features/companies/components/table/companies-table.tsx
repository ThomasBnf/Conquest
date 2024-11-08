"use client";

import { IsLoading } from "@/components/states/is-loading";
import { ActionMenu } from "@/features/table/action-menu";

import { QueryInput } from "@/components/custom/query-input";
import { Companies } from "@/components/icons/Companies";
import { useListCompanies } from "@/features/companies/hooks/useListCompanies";
import { useScrollX } from "@/features/table/hooks/useScrollX";
import { useHasScrollY } from "@/features/table/hooks/usehasScrollY";
import { useIsClient } from "@/hooks/useIsClient";
import { useParamsCompanies } from "@/hooks/useParamsCompanies";
import { Button } from "@conquest/ui/button";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { useSidebar } from "@conquest/ui/sidebar";
import { cn } from "@conquest/ui/utils/cn";
import type { Company } from "@conquest/zod/company.schema";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { Columns } from "./columns";

type Props = {
  initialCompanies: Company[] | undefined;
  count: number;
};

export const CompaniesTable = ({ initialCompanies, count }: Props) => {
  const { ref, inView } = useInView();
  const { open } = useSidebar();
  const [{ search, id, desc }, setSearchParams] = useParamsCompanies();
  const [rowSelected, setRowSelected] = useState<string[]>([]);
  const [debouncedSearch] = useDebounce(search, 500);

  const { companies, isLoading, fetchNextPage, hasNextPage } = useListCompanies(
    {
      initialCompanies,
      debouncedSearch,
      id,
      desc,
    },
  );

  const isClient = useIsClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollX = useScrollX({ isClient });
  const hasScrollY = useHasScrollY({ dependencies: [isClient, companies] });

  const columns = Columns();
  const fixedColumn = columns.slice(0, 2);
  const scrollableColumns = columns.slice(2);

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  if (!isClient) return <IsLoading />;

  return (
    <>
      <div className="px-4 min-h-12 flex items-center border-b">
        <QueryInput
          query={search}
          setQuery={(value) => setSearchParams({ search: value })}
          placeholder="Search in companies..."
        />
      </div>
      <div className="relative overflow-hidden h-full">
        <ScrollArea className="h-full overflow-hidden" ref={scrollRef}>
          <div className="sticky top-0 z-30 flex">
            <div
              className={cn(
                "sticky left-0 z-10 shrink-0 [&:not(:first-child)]:border-r border-b",
              )}
              style={{ width: fixedColumn[0]?.width }}
            >
              <div className="h-12 flex items-center">
                {fixedColumn[0]?.header({
                  companies,
                  rowSelected,
                  setRowSelected,
                })}
              </div>
              {scrollX > 0 && (
                <div className="absolute right-0 -mr-12 top-0 h-full bg-gradient-to-r from-black opacity-[0.075] to-transparent w-12" />
              )}
            </div>
            <div
              className={cn(
                "sticky left-[40px] z-10 shrink-0 border-r border-b",
              )}
              style={{ width: fixedColumn[1]?.width }}
            >
              <div className="h-12 flex items-center">
                {fixedColumn[1]?.header({})}
              </div>
              {scrollX > 0 && (
                <div className="absolute right-0 -mr-12 top-0 h-full bg-gradient-to-r from-black opacity-[0.075] to-transparent w-12" />
              )}
            </div>
            <div className="flex border-b divide-x">
              {scrollableColumns.map((column) => (
                <div
                  key={column.id}
                  className="h-12 flex items-center"
                  style={{ width: column.width }}
                >
                  {column.header({})}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex-grow">
            {companies.length ? (
              companies?.map((company, index) => (
                <div
                  key={company.id}
                  className={cn(
                    "[&:not(:last-child)]:border-b",
                    rowSelected.includes(company.id) && "bg-muted",
                  )}
                >
                  <div className="flex">
                    <div
                      className={cn(
                        "sticky left-0 [&:not(:first-child)]:border-r",
                        rowSelected.includes(company.id)
                          ? "bg-muted"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[0]?.width }}
                    >
                      <div className="h-12 flex items-center">
                        {fixedColumn[0]?.cell({
                          company,
                          rowSelected,
                          setRowSelected,
                        })}
                      </div>
                      {scrollX > 0 && (
                        <div className="absolute right-0 -mr-12 top-0 h-full bg-gradient-to-r from-black opacity-[0.075] to-transparent w-12" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "sticky left-[40px] border-r",
                        rowSelected.includes(company.id)
                          ? "bg-muted"
                          : "bg-background",
                      )}
                      style={{ width: fixedColumn[1]?.width }}
                    >
                      <div className="h-12 flex items-center">
                        {fixedColumn[1]?.cell({
                          company,
                          rowSelected,
                          setRowSelected,
                        })}
                      </div>
                      {scrollX > 0 && (
                        <div className="absolute right-0 -mr-12 top-0 h-full bg-gradient-to-r from-black opacity-[0.075] to-transparent w-12" />
                      )}
                    </div>
                    <div className="flex divide-x">
                      {scrollableColumns.map((column) => (
                        <div
                          key={column.id}
                          className="h-12 flex items-center"
                          style={{ width: column.width }}
                        >
                          {column.cell({ company })}
                        </div>
                      ))}
                    </div>
                  </div>
                  {!isLoading && companies.length - 20 === index && (
                    <div ref={ref} />
                  )}
                </div>
              ))
            ) : (
              <div
                className={cn(
                  "mx-auto w-full absolute top-36 flex flex-col items-center justify-center",
                  open ? "max-w-[calc(100vw-14rem)]" : "max-w-[100vw]",
                )}
              >
                <div className="flex items-center justify-center">
                  <Companies />
                </div>
                <p className="text-center font-medium text-lg">
                  No companies found
                </p>
                <p className="text-center text-muted-foreground mb-4">
                  None of your companies match the current filters
                </p>
                <Button onClick={() => setSearchParams({ search: "" })}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex bg-background",
              companies.length > 0 ? "border-t" : "border-b",
              hasScrollY ? "sticky bottom-0" : "border-b",
            )}
          >
            <div
              className="sticky left-0 border-r bg-background"
              style={{ width: 325 }}
            >
              <p
                className="flex items-center justify-end h-12 px-3 border-r"
                style={{ width: 325 }}
              >
                <span className="mr-auto text-muted-foreground">Count</span>
                <span className="mx-1 font-mono">{companies.length} /</span>
                <span className="text-muted-foreground font-mono">{count}</span>
              </p>
            </div>
          </div>
          {rowSelected.length > 0 && (
            <ActionMenu
              rowSelected={rowSelected}
              setRowSelected={setRowSelected}
              count={count}
            />
          )}
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </>
  );
};
