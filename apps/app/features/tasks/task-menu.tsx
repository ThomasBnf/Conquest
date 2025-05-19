"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Task } from "@conquest/zod/schemas/task.schema";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  task: Task;
};

export const TaskMenu = ({ task }: Props) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync: deleteTask } = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Task deleted");
    },
  });

  const onDelete = async () => {
    await deleteTask({ id: task.id });
  };

  return (
    <>
      <AlertDialog
        title="Delete task"
        description="Are you sure you want to delete this task?"
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon_sm">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
