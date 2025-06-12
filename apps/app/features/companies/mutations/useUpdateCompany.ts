import { trpc } from "@/server/client";
import { toast } from "sonner";

export const useUpdateCompany = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.companies.update.useMutation({
    onMutate: (updatedCompany) => {
      utils.companies.get.cancel({ id: updatedCompany.id });

      const previousCompany = utils.companies.get.getData({
        id: updatedCompany.id,
      });

      utils.companies.get.setData({ id: updatedCompany.id }, updatedCompany);

      return { previousCompany };
    },
    onError: (_, updatedCompany, context) => {
      utils.companies.get.setData(
        { id: updatedCompany.id },
        context?.previousCompany,
      );
      toast.error("Failed to update company");
    },
    onSettled: () => {
      utils.companies.invalidate();
    },
  });

  return mutateAsync;
};
