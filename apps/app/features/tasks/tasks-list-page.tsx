"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Task } from "@conquest/zod/schemas/task.schema";
import { isBefore, isToday } from "date-fns";
import { Suspense } from "react";
import { EmptyTasks } from "./empty-tasks";
import { TaskItem } from "./task-item";

export const TasksListPage = () => {
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();

  const completedTasks =
    tasks
      ?.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      ?.filter((task) => task.isCompleted) ?? [];

  const todayTasks =
    tasks
      ?.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      ?.filter((task) => {
        const isDueToday = isToday(task.dueDate);
        const isOverdue = isBefore(task.dueDate, new Date());
        const isNotCompleted = !task.isCompleted;

        return (isDueToday || isOverdue) && isNotCompleted;
      }) ?? [];

  const upcomingTasks =
    tasks
      ?.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      ?.filter((task) => {
        const isNotToday = !isToday(task.dueDate);
        const isInFuture = !isBefore(task.dueDate, new Date());
        const isNotCompleted = !task.isCompleted;

        return isNotToday && isInFuture && isNotCompleted;
      }) ?? [];

  if (isLoading) return <IsLoading />;
  if (tasks?.length === 0) return <EmptyTasks />;

  return (
    <div className="divide-y">
      <div className="flex flex-1 items-center px-4 py-2 text-muted-foreground">
        <p className="flex-[2]">Task</p>
        <p className="flex-1">Due Date</p>
        <p className="flex-1">Member</p>
        <p className="flex-1">Assigned to</p>
        <div className="w-6" />
      </div>
      <div className="divide-y">
        <TaskSection title="Today" tasks={todayTasks} />
        <TaskSection title="Upcoming" tasks={upcomingTasks} />
        <TaskSection title="Completed" tasks={completedTasks} />
      </div>
    </div>
  );
};

const TaskSection = ({ title, tasks }: { title: string; tasks: Task[] }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="divide-y">
      <div className="flex items-center gap-2 bg-surface px-4 py-2">
        <p>{title}</p>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>
      <div className="divide-y">
        <Suspense fallback={<IsLoading />}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </Suspense>
      </div>
    </div>
  );
};
