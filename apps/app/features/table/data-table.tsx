import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { type Table, flexRender } from "@tanstack/react-table";
import { ActionMenu } from "./action-menu";
import { DataTablePagination } from "./data-table-pagination";
import { TableSkeleton } from "./table-skeletton";

type Props<TData> = {
  table: Table<TData>;
  count: number;
  isLoading: boolean;
};

export const DataTable = <TData,>({
  table,
  count,
  isLoading,
}: Props<TData>) => {
  if (isLoading) return <TableSkeleton />;

  return (
    <>
      <ScrollArea className="h-full">
        <div style={{ width: table.getTotalSize() }}>
          <div className="sticky top-0 left-0 z-20 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex items-center">
                {headerGroup.headers.map((header) => {
                  const { column } = header;
                  const isPinned = header.column.getIsPinned();

                  return (
                    <div
                      key={header.id}
                      className={cn(
                        "h-11 border-r bg-sidebar",
                        isPinned && "sticky z-10",
                      )}
                      style={{
                        width: column.getSize(),
                        left:
                          isPinned === "left"
                            ? `${column.getStart("left")}px`
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div>
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "flex items-center",
                  row.index === table.getRowModel().rows.length - 1 &&
                    "[&_td]:after:border-b-0",
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const { column } = cell;
                  const isPinned = column.getIsPinned();

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        "flex h-11 items-center border-r border-b bg-background",
                        isPinned && "sticky z-0",
                      )}
                      style={{
                        width: column.getSize(),
                        left:
                          isPinned === "left"
                            ? `${column.getStart("left")}px`
                            : undefined,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <ActionMenu table={table} />
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <DataTablePagination table={table} count={count} />
    </>
  );
};
