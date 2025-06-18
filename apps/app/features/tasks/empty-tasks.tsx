import { Tasks } from "@conquest/ui/icons/Tasks";
import { CreateTaskDialog } from "./create-task-dialog";

export const EmptyTasks = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Tasks />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No tasks found</p>
        <p className="text-muted-foreground">
          You don't have any tasks yet in workspace.
        </p>
      </div>
      <CreateTaskDialog />
    </div>
  );
};
