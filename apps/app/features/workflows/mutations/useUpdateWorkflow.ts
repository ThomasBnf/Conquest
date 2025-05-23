import { trpc } from "@/server/client";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { toast } from "sonner";

export const useUpdateWorkflow = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workflows.update.useMutation({
    onMutate: (updatedWorkflow) => {
      const parsedWorkflow = WorkflowSchema.parse(updatedWorkflow);
      const { id } = parsedWorkflow;

      utils.workflows.get.cancel({ id });
      const previousWorkflow = utils.workflows.get.getData({ id });
      utils.workflows.get.setData({ id }, parsedWorkflow);

      return { previousWorkflow };
    },
    onError: (_, { id }, context) => {
      toast.error("Failed to update workflow");
      utils.workflows.get.setData({ id }, context?.previousWorkflow);
    },
    onSettled: (_, __, { id }) => {
      utils.workflows.get.invalidate({ id });
      utils.workflows.list.invalidate();
    },
  });

  return mutateAsync;
};
