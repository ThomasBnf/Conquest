import { trpc } from "@/server/client";
import { toast } from "sonner";

export const useCreateField = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.customFields.create.useMutation({
    onMutate: (updatedField) => {
      utils.customFields.list.cancel({ record: updatedField.record });

      const previousField = utils.customFields.list.getData({
        record: updatedField.record,
      });

      utils.customFields.list.setData({ record: updatedField.record }, [
        ...(previousField ?? []),
        updatedField,
      ]);

      return { previousField };
    },
    onError: (_, updatedField, context) => {
      utils.customFields.list.setData(
        { record: updatedField.record },
        context?.previousField,
      );
      toast.error("Failed to create field");
    },
    onSettled: () => {
      utils.customFields.invalidate();
    },
  });

  return mutateAsync;
};
