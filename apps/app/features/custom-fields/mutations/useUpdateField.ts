import { trpc } from "@/server/client";
import { toast } from "sonner";

export const useUpdateField = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.customFields.update.useMutation({
    onMutate: (updatedField) => {
      utils.customFields.list.cancel({ record: updatedField.record });

      const previousFields = utils.customFields.list.getData({
        record: updatedField.record,
      });

      utils.customFields.list.setData(
        { record: updatedField.record },
        (old) =>
          old?.map((field) =>
            field.id === updatedField.id ? updatedField : field,
          ) ?? [updatedField],
      );

      return { previousFields };
    },
    onError: (_, updatedField, context) => {
      utils.customFields.list.setData(
        { record: updatedField.record },
        context?.previousFields,
      );
      toast.error("Failed to update field");
    },
    onSettled: () => {
      utils.customFields.invalidate();
    },
  });

  return mutateAsync;
};
