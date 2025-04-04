import { useTable } from "@/hooks/useTable";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Separator } from "@conquest/ui/separator";
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { ChevronDown, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { AddTagDialog } from "./add-tag-dialog";
import { RemoveTagDialog } from "./remove-tag-dialog";

type Props<TData extends Member | Company> = {
  table: ReturnType<typeof useTable<TData>>;
};

export const TagDialog = <TData extends Member | Company>({
  table,
}: Props<TData>) => {
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
            Add tags
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenRemove(true)}>
            <X size={16} />
            Remove tags
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
