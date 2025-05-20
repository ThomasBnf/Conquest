import { trpc } from "@/server/client";
import { toast } from "sonner";

export const useUpdateWorkspace = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workspaces.update.useMutation({
    onMutate: (updatedWorkspace) => {
      utils.workspaces.get.cancel();

      const previousWorkspace = utils.workspaces.get.getData();

      utils.workspaces.get.setData(undefined, updatedWorkspace);

      return { previousWorkspace };
    },
    onError: (_, __, context) => {
      utils.workspaces.get.setData(undefined, context?.previousWorkspace);
      toast.error("Failed to update workspace");
    },
    onSettled: () => {
      utils.members.invalidate();
    },
  });

  return mutateAsync;
};
