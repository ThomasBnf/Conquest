import { trpc } from "@/server/client";

export const useDeleteTag = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tags.delete.useMutation({
    async onMutate(newTag) {
      await utils.tags.list.cancel();

      const prevData = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (old) =>
        old?.filter((tag) => tag.id !== newTag.id),
      );

      return { prevData };
    },
    onError: (_err, _newTag, context) => {
      utils.tags.list.setData(undefined, context?.prevData);
    },
    onSettled: () => {
      utils.tags.list.invalidate();
      utils.members.invalidate();
      utils.companies.invalidate();
    },
  });

  return mutateAsync;
};
