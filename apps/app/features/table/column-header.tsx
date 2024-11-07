"use client";

import { useParamsMembers } from "@/hooks/useParamsMembers";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { cn } from "@conquest/ui/utils/cn";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type Column = {
  id: string;
  header: (args: {
    members?: MemberWithActivities[];
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  cell: (args: {
    member: MemberWithActivities;
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  width: number;
};

type Props = {
  id: string;
  title: string;
  width: number;
  className?: string;
  isSorted?: "asc" | "desc" | false;
};

export const ColumnHeader = ({
  id,
  title,
  width,
  className,
  isSorted,
}: Props) => {
  const [_, setParamsMembers] = useParamsMembers();

  const onSort = (desc: boolean) => {
    setParamsMembers({
      id,
      desc,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn("h-12 rounded-none", className)}
          style={{ width }}
        >
          {title}
          {isSorted === "desc" ? (
            <ArrowDownIcon size={14} className="ml-auto" />
          ) : isSorted === "asc" ? (
            <ArrowUpIcon size={14} className="ml-auto" />
          ) : (
            <CaretSortIcon className="size-4 ml-auto" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ width: width - 5 }}
        alignOffset={2}
      >
        <DropdownMenuItem onClick={() => onSort(false)}>
          <ArrowUpIcon size={16} className="mr-2 text-muted-foreground" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort(true)}>
          <ArrowDownIcon size={16} className="mr-2 text-muted-foreground" />
          Desc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
