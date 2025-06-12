import { AlertDialog } from "@/components/custom/alert-dialog";
import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { List } from "@conquest/zod/schemas/list.schema";
import { MoreHorizontal, Pen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EditListDialog } from "./edit-list-dialog";

type Props = {
  list: List;
  transparent?: boolean;
};

export const MenuList = ({ list, transparent = false }: Props) => {
  const { slug } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.lists.delete.useMutation({
    onSuccess: () => {
      utils.lists.list.invalidate();
      toast.success("List deleted");
      router.push(`/${slug}/members`);
    },
  });

  const onDelete = async () => {
    await mutateAsync({ id: list.id });
  };

  return (
    <>
      <AlertDialog
        title="Delete list"
        description="Are you sure you want to delete this list?"
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <EditListDialog list={list} open={editOpen} setOpen={setEditOpen} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={transparent ? "outline" : "outline"}
            size={transparent ? "icon_sm" : "icon"}
          >
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pen size={16} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
