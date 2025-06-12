import { trpc } from "@/server/client";
import { Record } from "@conquest/zod/enum/record.enum";
import { toast } from "sonner";

type Props = {
  record: Record;
};

export const useDeleteField = ({ record }: Props) => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.customFields.delete.useMutation({
    onMutate: (deletedField) => {
      utils.customFields.list.cancel({ record });

      const previousFields = utils.customFields.list.getData({ record });

      utils.customFields.list.setData(
        { record },
        (old) => old?.filter((field) => field.id !== deletedField.id) ?? [],
      );

      return { previousFields };
    },
    onError: (_, __, context) => {
      utils.customFields.list.setData({ record }, context?.previousFields);
      toast.error("Failed to delete field");
    },
    onSettled: () => {
      utils.customFields.list.invalidate({ record });
      utils.members.invalidate();
      utils.companies.invalidate();
    },
  });

  return mutateAsync;
};
