import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Separator } from "@conquest/ui/separator";
import type { Table } from "@tanstack/react-table";
import { ChevronDown, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { AddTagDialog } from "./add-tag-dialog";
import { RemoveTagDialog } from "./remove-tag-dialog";

type Props<TData> = {
  table: Table<TData>;
};

export const TagDialog = <TData,>({ table }: Props<TData>) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

  return (
    <>
      <AddTagDialog open={openAdd} setOpen={setOpenAdd} table={table} />
      <RemoveTagDialog
        open={openRemove}
        setOpen={setOpenRemove}
        table={table}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Tag size={16} />
            Tags
            <Separator orientation="vertical" />
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setOpenAdd(true)}>
            <Plus size={16} />
            Add tag
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenRemove(true)}>
            <X size={16} />
            Remove tag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
