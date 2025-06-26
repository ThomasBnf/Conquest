import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Level } from "@conquest/zod/schemas/level.schema";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditLevelDialog } from "./edit-level-dialog";

type Props = {
  level: Level;
};

export const MenuLevel = ({ level }: Props) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.levels.delete.useMutation({
    onSuccess: () => {
      utils.levels.list.invalidate();
    },
  });

  const onDeleteLevel = async () => {
    await mutateAsync({ number: level.number });
    toast.error("Level deleted");
  };

  return (
    <>
      <AlertDialog
        title={`Delete the level "${level.name}"?`}
        description="This action cannot be undone."
        onConfirm={onDeleteLevel}
        open={showAlert}
        setOpen={setShowAlert}
      />
      <EditLevelDialog level={level} open={editOpen} setOpen={setEditOpen} />
      <DropdownMenu open={open} onOpenChange={setOpen} modal>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit2 size={16} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowAlert(true)}
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
