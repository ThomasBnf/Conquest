import { useParamsMembers } from "@/hooks/useParamsMembers";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { cn } from "@conquest/ui/utils/cn";
import { CaretSortIcon } from "@radix-ui/react-icons";
import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

type Props<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>;
  title: string;
};

export function Header<TData, TValue>({
  column,
  title,
  className,
}: Props<TData, TValue>) {
  const [_, setParamsMembers] = useParamsMembers();

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-10 text-xs uppercase text-muted-foreground flex-1 rounded-none data-[state=open]:bg-accent"
          >
            {title}
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon size={14} className="ml-auto" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon size={14} className="ml-auto" />
            ) : (
              <CaretSortIcon className="size-4 ml-auto" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => {
              column.toggleSorting(false);
              setParamsMembers({
                id: column.id,
                desc: false,
              });
            }}
          >
            <ArrowUpIcon size={16} className="mr-2 text-muted-foreground" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              column.toggleSorting(true);
              setParamsMembers({
                id: column.id,
                desc: true,
              });
            }}
          >
            <ArrowDownIcon size={16} className="mr-2 text-muted-foreground" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
