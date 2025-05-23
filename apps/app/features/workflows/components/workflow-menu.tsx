"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { useGetSlug } from "@/hooks/useGetSlug";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { Archive, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useDeleteWorkflow } from "../mutations/useDeleteWorkflow";
import { useUpdateWorkflow } from "../mutations/useUpdateWorkflow";

type Props = {
  workflow: Workflow;
  hasRuns?: boolean;
};

export const WorkflowMenu = ({ workflow, hasRuns }: Props) => {
  const [open, setOpen] = useState(false);
  const [archive, setArchive] = useState(false);
  const { archivedAt } = workflow;

  const deleteWorkflow = useDeleteWorkflow();
  const updateWorkflow = useUpdateWorkflow();

  const slug = useGetSlug();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workflows.duplicate.useMutation({
    onSuccess: ({ id }) => {
      utils.workflows.list.invalidate();
      router.push(`/${slug}/workflows/${id}/editor`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDuplicate = async () => {
    await mutateAsync({
      ...workflow,
      id: uuid(),
      published: false,
      archivedAt: null,
    });
  };

  const onArchive = async () => {
    await updateWorkflow({
      ...workflow,
      published: false,
      archivedAt: new Date(),
    });
  };

  const onUnarchive = async () => {
    await updateWorkflow({
      ...workflow,
      published: true,
      archivedAt: null,
    });
  };

  const onDelete = async () => {
    await deleteWorkflow({ id: workflow.id });
  };

  return (
    <>
      <AlertDialog
        title="Delete workflow"
        description="Are you sure you want to delete this workflow?"
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <AlertDialog
        title="Archive workflow"
        description="Are you sure you want to archive this workflow?"
        onConfirm={onArchive}
        open={archive}
        setOpen={setArchive}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy size={16} />
            Duplicate
          </DropdownMenuItem>
          {archivedAt ? (
            <DropdownMenuItem onClick={onUnarchive}>
              <Archive size={16} />
              Unarchive
            </DropdownMenuItem>
          ) : hasRuns ? (
            <DropdownMenuItem onClick={() => setArchive(true)}>
              <Archive size={16} />
              Archive
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={16} />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
