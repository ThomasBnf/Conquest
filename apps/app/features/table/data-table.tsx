import { useTable } from "@/hooks/useTable";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ActionsMenu } from "./settings/actions-menu";
import { TableSkeleton } from "./table-skeletton";

type Props<TData extends Member | Company> = {
  table: ReturnType<typeof useTable<TData>>;
};

export const DataTable = <TData extends Member | Company>({
  table,
}: Props<TData>) => {
  const { ref, inView } = useInView();

  const {
    data,
    columns,
    count,
    isLoading,
    fetchNextPage,
    hasNextPage,
    columnVisibility,
    columnOrder,
  } = table;

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <ScrollArea className="h-full">
        <div className="relative">
          <div className="sticky top-0 z-20 flex items-center border-b">
            {columns
              .filter((column) => !columnVisibility[column.key])
              .sort((a, b) => {
                const aIndex = columnOrder.indexOf(a.key);
                const bIndex = columnOrder.indexOf(b.key);
                return aIndex - bIndex;
              })
              .map((column) => (
                <div
                  key={column.key}
                  className={cn(
                    "border-r bg-sidebar p-2",
                    column.isFixed && "sticky left-0",
                  )}
                  style={{ width: column.width }}
                >
                  {column.header({ table })}
                </div>
              ))}
          </div>
          <div>
            {data?.map((item) => (
              <div
                key={item.id}
                className="z-0 flex h-full border-b last:border-b-0"
              >
                {columns
                  .filter((column) => !columnVisibility[column.key])
                  .sort((a, b) => {
                    const aIndex = columnOrder.indexOf(a.key);
                    const bIndex = columnOrder.indexOf(b.key);
                    return aIndex - bIndex;
                  })
                  .map((column) => (
                    <div
                      key={column.key}
                      className={cn(
                        "flex h-11 items-center border-r bg-background ",
                        column.isFixed && "sticky left-0",
                        column.key === "tags" ? "p-O" : "px-2",
                      )}
                      style={{ width: column.width }}
                    >
                      {column.cell({ item, table })}
                    </div>
                  ))}
              </div>
            ))}
            <div ref={ref} />
          </div>
        </div>
        <ScrollBar orientation="horizontal" className="z-20" />
        <ScrollBar orientation="vertical" className="z-20" />
      </ScrollArea>
      <ActionsMenu table={table} />
      <p className="space-x-1 border-t px-3 py-2">
        <span className="font-medium">{count}</span>
        <span className="text-muted-foreground">
          Member{count === 1 ? "" : "s"}
        </span>
      </p>
    </div>
  );
};
