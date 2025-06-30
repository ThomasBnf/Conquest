import { trpc } from "@/server/client";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { toast } from "sonner";

export const useUpdateWorkflow = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workflows.update.useMutation({
    onMutate: async (updatedWorkflow) => {
      await utils.workflows.list.cancel();
      await utils.workflows.get.cancel();

      const parsedWorkflow = WorkflowSchema.parse(updatedWorkflow);
      const { id } = parsedWorkflow;

      const previousWorkflows = utils.workflows.list.getData();
      const previousWorkflow = utils.workflows.get.getData({ id });

      utils.workflows.list.setData(undefined, (old) => {
        if (!old) return old;

        return old.map((w) => (w.id === id ? { ...w, ...parsedWorkflow } : w));
      });
      utils.workflows.get.setData({ id }, (old) => {
        if (!old) return parsedWorkflow;
        return { ...old, ...parsedWorkflow };
      });

      return { previousWorkflows, previousWorkflow };
    },
    onError: (error, __, context) => {
      utils.workflows.list.setData(undefined, context?.previousWorkflows);

      if (context?.previousWorkflow?.id) {
        utils.workflows.get.setData(
          { id: context.previousWorkflow.id },
          context.previousWorkflow,
        );
      }
      toast.error(error.message);
    },
    onSettled: () => {
      utils.workflows.list.invalidate();
      utils.workflows.get.invalidate();
    },
  });

  return mutateAsync;
};
