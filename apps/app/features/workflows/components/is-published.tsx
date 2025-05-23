"use client";

import { trpc } from "@/server/client";
import { Switch } from "@conquest/ui/switch";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { toast } from "sonner";

type Props = {
  workflow: Workflow;
  displaySwitch?: boolean;
};

export const IsPublished = ({ workflow, displaySwitch = true }: Props) => {
  const { published, archivedAt } = workflow;
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workflows.update.useMutation({
    onMutate: async () => {
      await utils.workflows.list.cancel();
      await utils.workflows.get.cancel();

      const previousWorkflows = utils.workflows.list.getData();
      const previousWorkflow = utils.workflows.get.getData({ id: workflow.id });

      utils.workflows.list.setData(undefined, (old) => {
        return old?.map((w) =>
          w.id === workflow.id ? { ...w, published: !published } : w,
        );
      });
      utils.workflows.get.setData({ id: workflow.id }, (old) => {
        if (!old) return undefined;
        return { ...old, published: !published };
      });

      return { previousWorkflows, previousWorkflow };
    },
    onError: (error, __, context) => {
      utils.workflows.list.setData(undefined, context?.previousWorkflows);
      utils.workflows.get.setData(
        { id: workflow.id },
        context?.previousWorkflow,
      );
      toast.error(error.message);
    },
    onSettled: () => {
      utils.workflows.list.invalidate();
      utils.workflows.get.invalidate({ id: workflow.id });
    },
  });

  const onTogglePublished = async () => {
    await mutateAsync({
      ...workflow,
      published: !published,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {archivedAt ? (
        <p className="flex h-6 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Archived
        </p>
      ) : published ? (
        <div className="flex h-6 items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1 ">
          <div className="relative size-2">
            <div className="absolute inset-0 size-2 rounded-full bg-green-500" />
            <div className="absolute inset-0 size-2 animate-ping rounded-full bg-green-500" />
          </div>
          <p className="text-green-700">Live</p>
        </div>
      ) : (
        <p className="flex h-6 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Draft
        </p>
      )}
      {displaySwitch && (
        <Switch checked={published} onClick={onTogglePublished} />
      )}
    </div>
  );
};
