import { tableParams } from "@/utils/tableParams";
import { Button } from "@conquest/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryStates } from "nuqs";

type Props<TData> = {
  table: Table<TData>;
  count: number;
};

export const DataTablePagination = <TData,>({ table, count }: Props<TData>) => {
  const [{ pageSize }, setParams] = useQueryStates(tableParams);

  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">
          Showing {table.getRowCount()} of {count}
        </p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            setParams({ page: 0, pageSize: Number(value) });
            table.setPageSize(Number(value));
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[25, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="size-8"
            onClick={() => {
              setParams({ page: table.getState().pagination.pageIndex - 1 });
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setParams({ page: table.getState().pagination.pageIndex + 1 });
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
