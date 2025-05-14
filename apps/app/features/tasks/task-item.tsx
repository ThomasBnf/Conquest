import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import { Task } from "@conquest/zod/schemas/task.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { EditTaskDialog } from "./edit-task-dialog";
import { useUpdateTask } from "./mutations/useUpdateTask";
import { TaskMenu } from "./task-menu";

type Props = {
  task: Task;
};

export const TaskItem = ({ task }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};
  const [open, setOpen] = useState(false);

  const { memberId, assignee } = task;

  const { data: member } = trpc.members.get.useQuery(
    memberId ? { id: memberId } : skipToken,
  );

  const { avatarUrl, firstName } = member ?? {};

  const { data: user } = trpc.users.get.useQuery(
    assignee ? { id: assignee } : skipToken,
  );

  const updateTask = useUpdateTask({ task });

  const onToggle = async () => {
    await updateTask({ ...task, isCompleted: !task.isCompleted });
  };

  return (
    <>
      <EditTaskDialog open={open} setOpen={setOpen} task={task} />
      <div
        key={task.id}
        className={cn(
          "flex items-center justify-between px-4 py-2 hover:bg-muted-hover",
          task.isCompleted && "opacity-50",
        )}
      >
        <div
          onClick={() => setOpen(true)}
          className="flex flex-1 cursor-pointer items-center"
        >
          <div className="flex flex-[2] items-center gap-2">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              className="size-[18px]"
            />
            <p>{task.title}</p>
          </div>
          <p className="flex-1">Due {format(task.dueDate, "PP")}</p>
          <div className="h-7 flex-1">
            {member && (
              <Link
                href={`/${slug}/members/${member?.id}/analytics`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-fit px-1 py-0.5",
                )}
                onClick={(e) => e.stopPropagation()}
                prefetch
              >
                <Avatar className="size-4">
                  <AvatarImage src={avatarUrl ?? ""} />
                  <AvatarFallback className="text-xs">
                    {firstName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p>
                  {member?.firstName} {member?.lastName}
                </p>
              </Link>
            )}
          </div>
          <p className="flex-1">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <TaskMenu task={task} />
      </div>
    </>
  );
};
