import { trpc } from "@/server/client";

export const useDeleteTag = () => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tags.delete.useMutation({
    async onMutate(deletedTag) {
      await utils.tags.list.cancel();

      const prevData = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (old) =>
        old?.filter((tag) => tag.id !== deletedTag.id),
      );

      return { prevData };
    },
    onError: (err, deletedTag, context) => {
      utils.tags.list.setData(undefined, context?.prevData);
    },
    onSettled: (_data, _error) => {
      utils.tags.list.invalidate();
      utils.members.invalidate();
      utils.companies.invalidate();
    },
  });

  return mutateAsync;
};
