import { useTable } from "@/hooks/useTable";
import { tableCompaniesParams, tableMembersParams } from "@/utils/tableParams";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import {
  ArrowDown,
  ArrowUp,
  Check,
  EllipsisVertical,
  EyeOff,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";

type Props<TData extends Member | Company> = {
  columnId: string;
  title: string;
  type?: string | number | Date;
  isFixed?: boolean;
  table: ReturnType<typeof useTable<TData>>;
};

export const ColumnHeader = <TData extends Member | Company>({
  columnId,
  title,
  type,
  isFixed,
  table,
}: Props<TData>) => {
  const { onVisibilityChange } = table;
  const pathname = usePathname();
  const isCompanies = pathname.includes("companies");

  const params = useQueryStates(
    isCompanies ? tableCompaniesParams : tableMembersParams,
  );
  const [{ id, desc }, setParams] = params;

  const columnSortAsc = () => {
    switch (type) {
      case "string":
        return (
          <>
            <ArrowUp size={16} className="text-muted-foreground" />
            Sort A-Z
          </>
        );
      case "number":
        return (
          <>
            <ArrowUp size={16} className="text-muted-foreground" />
            Sort 0-9
          </>
        );
      case "Date":
        return (
          <>
            <ArrowUp size={16} className="text-muted-foreground" />
            Sort Oldest
          </>
        );
    }
  };

  const columnSortDesc = () => {
    switch (type) {
      case "string":
        return (
          <>
            <ArrowDown size={16} className="text-muted-foreground" />
            Sort Z-A
          </>
        );
      case "number":
        return (
          <>
            <ArrowDown size={16} className="text-muted-foreground" />
            Sort 9-0
          </>
        );
      case "Date":
        return (
          <>
            <ArrowDown size={16} className="text-muted-foreground" />
            Sort Newest
          </>
        );
    }
  };

  return (
    <div className="flex h-full flex-1 items-center justify-between">
      <div className="flex items-center gap-2">
        <p>{title}</p>
        {columnId === id && (
          <div>{desc ? <ArrowDown size={16} /> : <ArrowUp size={16} />}</div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon_sm">
            <EllipsisVertical size={14} className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {type && (
            <>
              <DropdownMenuItem
                onClick={() => setParams({ id: columnId, desc: false })}
              >
                {columnSortAsc()}
                {columnId === id && desc === false && (
                  <Check size={16} className="ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ id: columnId, desc: true })}
              >
                {columnSortDesc()}
                {columnId === id && desc && (
                  <Check size={16} className="ml-auto" />
                )}
              </DropdownMenuItem>
            </>
          )}
          {!isFixed && (
            <DropdownMenuItem onClick={() => onVisibilityChange(id)}>
              <EyeOff size={16} className="text-muted-foreground" />
              <p>Hide</p>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
