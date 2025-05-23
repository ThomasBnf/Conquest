import { trpc } from "@/server/client";

export const useDeleteWorkflow = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workflows.delete.useMutation({
    async onMutate(deletedWorkflow) {
      await utils.workflows.list.cancel();

      const prevData = utils.workflows.list.getData();

      utils.workflows.list.setData(undefined, (old) =>
        old?.filter((workflow) => workflow.id !== deletedWorkflow.id),
      );

      return { prevData };
    },
    onError: (err, deletedWorkflow, context) => {
      utils.workflows.list.setData(undefined, context?.prevData);
    },
    onSettled: (_data, _error, variables) => {
      utils.workflows.list.invalidate();
      utils.workflows.get.invalidate({ id: variables.id });
    },
  });

  return mutateAsync;
};
