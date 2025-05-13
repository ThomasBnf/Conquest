"use client";

import { trpc } from "@/server/client";

export const TasksListPage = () => {
  const { data: tasks } = trpc.tasks.list.useQuery();

  const groupedActivities = () => {
    if (!tasks) return {};

    return tasks.reduce(
      (groups, task) => {
        const dueDate = task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : "Sans date";

        if (!groups[dueDate]) {
          groups[dueDate] = [];
        }

        groups[dueDate].push(task);
        return groups;
      },
      {} as Record<string, typeof tasks>,
    );
  };

  console.log(groupedActivities);

  return (
    <div className="divide-y">
      <div className="flex flex-1 items-center px-4 py-2 text-muted-foreground">
        <p className="flex-[2]">Task</p>
        <p className="flex-1">Due Date</p>
        <p className="flex-1">Member</p>
        <p className="flex-1">Assigned to</p>
      </div>
      <div className="bg-muted px-4 py-2">
        <p>Today</p>
      </div>
      <div>
        {tasks?.map((task) => (
          <div key={task.id}>
            <p>{task.title}</p>
            <p>{task.memberId}</p>
            <p>{task.assignee}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
