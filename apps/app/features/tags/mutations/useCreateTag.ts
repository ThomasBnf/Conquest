import { trpc } from "@/server/client";
import { toast } from "sonner";

type Props = {
  tags?: string[];
  onUpdate?: (tags: string[]) => void;
};

export const useCreateTag = ({ tags, onUpdate }: Props) => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tags.post.useMutation({
    onMutate: async (newTag) => {
      await utils.tags.list.cancel();

      const previousTags = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (prevTags) => {
        return [...(prevTags ?? []), newTag];
      });

      onUpdate?.(tags ? [...tags, newTag.id] : [newTag.id]);

      return { previousTags, newTag };
    },
    onError: (_, __, context) => {
      toast.error("Failed to create tag");
      if (context?.previousTags) {
        utils.tags.list.setData(undefined, context.previousTags);
      }
      onUpdate?.(tags ?? []);
    },
    onSettled: () => {
      utils.tags.invalidate();
    },
  });

  return mutateAsync;
};
