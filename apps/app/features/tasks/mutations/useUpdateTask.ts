import { trpc } from "@/server/client";
import { Task } from "@conquest/zod/schemas/task.schema";
import { toast } from "sonner";

type Props = {
  task?: Task;
};

export const useUpdateTask = ({ task }: Props) => {
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tasks.update.useMutation({
    onMutate: async (updatedTask) => {
      await utils.tasks.list.cancel();

      const previousTasks = utils.tasks.list.getData();

      utils.tasks.list.setData(undefined, (old) => {
        return old?.map((t) =>
          t.id === task?.id ? { ...t, ...updatedTask } : t,
        );
      });

      return { previousTasks };
    },
    onError: (_, __, context) => {
      toast.error("Failed to update task");
      if (context?.previousTasks) {
        utils.tasks.list.setData(undefined, context.previousTasks);
      }
    },
    onSettled: () => {
      utils;
      utils.tasks.invalidate();
    },
  });

  return mutateAsync;
};
