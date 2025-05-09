import { trpc } from "@/server/client";
import { toast } from "sonner";

export const useDeleteMember = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.members.delete.useMutation({
    onMutate: (deletedMember) => {
      utils.members.get.cancel({ id: deletedMember.id });

      const previousMember = utils.members.get.getData({
        id: deletedMember.id,
      });

      utils.members.get.setData({ id: deletedMember.id }, undefined);

      return { previousMember };
    },
    onError: (_, deletedMember, context) => {
      utils.members.get.setData(
        { id: deletedMember.id },
        context?.previousMember,
      );
      toast.error("Failed to delete member");
    },
    onSettled: () => {
      utils.members.invalidate();
    },
  });

  return mutateAsync;
};
