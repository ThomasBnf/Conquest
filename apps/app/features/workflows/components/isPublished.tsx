"use client";

import { trpc } from "@/server/client";
import { Switch } from "@conquest/ui/switch";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { toast } from "sonner";

type Props = {
  workflow: Workflow;
};

export const IsPublished = ({ workflow }: Props) => {
  const { published } = workflow;
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
      id: workflow.id,
      published: !published,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {published ? (
        <div className="flex h-6 items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1">
          <div className="size-2.5 animate-pulse rounded-full bg-green-500" />
          <p className="text-green-700">Live</p>
        </div>
      ) : (
        <p className="flex h-6 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Draft
        </p>
      )}
      <Switch checked={published} onClick={onTogglePublished} />
    </div>
  );
};
