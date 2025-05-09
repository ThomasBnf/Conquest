import { trpc } from "@/server/client";
import { toast } from "sonner";

export const useUpdateMember = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.members.update.useMutation({
    onMutate: (updatedMember) => {
      utils.members.get.cancel({ id: updatedMember.id });

      const previousMember = utils.members.get.getData({
        id: updatedMember.id,
      });

      utils.members.get.setData({ id: updatedMember.id }, updatedMember);

      return { previousMember };
    },
    onError: (_, updatedMember, context) => {
      utils.members.get.setData(
        { id: updatedMember.id },
        context?.previousMember,
      );
      toast.error("Failed to update member");
    },
    onSettled: () => {
      utils.members.invalidate();
    },
  });

  return mutateAsync;
};
