import { trpc } from "@/server/client";
import { toast } from "sonner";

type Props = {
  setOpen: (open: boolean) => void;
  reset: () => void;
};

export const useCreateTask = ({ setOpen, reset }: Props) => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tasks.post.useMutation({
    onMutate: async (newTask) => {
      await utils.tasks.list.cancel();

      const previousTasks = utils.tasks.list.getData();

      utils.tasks.list.setData(undefined, (prevTasks) => {
        return [...(prevTasks ?? []), newTask];
      });

      return { previousTasks, newTask };
    },
    onError: (_, __, context) => {
      console.log(_);
      toast.error("Failed to create task");
      if (context?.previousTasks) {
        utils.tasks.list.setData(undefined, context.previousTasks);
      }
    },
    onSettled: () => {
      utils.tasks.invalidate();
      setOpen(false);
      reset();
    },
  });

  return mutateAsync;
};
