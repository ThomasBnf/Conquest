import { tableParsers } from "@/lib/searchParamsTable";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@conquest/ui/select";
import type { Column, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";

type Props<TData, TValue> = {
  table: Table<TData>;
  column: Column<TData, TValue>;
  title: string;
};

export const ColumnHeader = <TData, TValue>({
  table,
  column,
  title,
}: Props<TData, TValue>) => {
  const pathname = usePathname();
  const type = pathname.includes("companies") ? "companies" : "members";
  const [, setParams] = useQueryStates(tableParsers);

  if (!column.getCanSort()) return <div>{title}</div>;

  const onValueChange = (value: string) => {
    const isDescending = value === "desc";
    column.toggleSorting(isDescending);

    const params = {
      page: 0,
      [type === "companies" ? "idCompany" : "idMember"]: column.id,
      [type === "companies" ? "descCompany" : "descMember"]: isDescending,
    };

    setParams(params);
    table.setPageIndex(0);
  };

  return (
    <Select
      value={
        column.getIsSorted() === "desc"
          ? "desc"
          : column.getIsSorted() === "asc"
            ? "asc"
            : undefined
      }
      onValueChange={(value) => onValueChange(value)}
    >
      <SelectTrigger
        className={cn(
          buttonVariants({ variant: "transparent" }),
          "h-11 justify-between rounded-none border-none shadow-none hover:bg-sidebar-accent focus:ring-0 focus-visible:outline-none [&>svg:last-child]:hidden",
        )}
      >
        <span className="text-foreground">{title}</span>
        {column.getCanSort() && column.getIsSorted() === "desc" ? (
          <ArrowDown size={14} className="text-muted-foreground" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronsUpDown size={13} />
        )}
      </SelectTrigger>
      <SelectContent align="start">
        {column.getCanSort() && (
          <>
            <SelectItem value="asc">
              <span className="flex items-center">
                <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
                Asc
              </span>
            </SelectItem>
            <SelectItem value="desc">
              <span className="flex items-center">
                <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
                Desc
              </span>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
};
