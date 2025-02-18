"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  workflow: Workflow;
};

export const WorkflowMenu = ({ workflow }: Props) => {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!workflow) return;

    // const rWorkflow = await deleteWorkflow({ id: workflow.id });
    // const error = rWorkflow?.serverError;

    // if (error) return toast.error(error);
  };

  return (
    <>
      {/* <AlertDialog
        title="Delete workflow"
        description="Are you sure you want to delete this workflow?"
        onConfirm={handleDelete}
        open={open}
        setOpen={setOpen}
      /> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
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
