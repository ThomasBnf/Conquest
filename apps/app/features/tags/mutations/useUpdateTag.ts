import { trpc } from "@/server/client";
import { Tag } from "@conquest/zod/schemas/tag.schema";

type Props = {
  tag?: Tag;
};

export const useUpdateTag = ({ tag }: Props) => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tags.update.useMutation({
    onMutate: ({ name, color }) => {
      utils.tags.list.cancel();

      const previousTags = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (old) => {
        return old?.map((t) =>
          t.id === tag?.id
            ? { ...t, name: name ?? t.name, color: color ?? t.color }
            : t,
        );
      });

      return { previousTags };
    },
    onError: (error, variables, context) => {
      if (context) {
        utils.tags.list.setData(undefined, context.previousTags);
      }
    },
    onSettled: () => {
      utils.tags.list.invalidate();
    },
  });

  return mutateAsync;
};
