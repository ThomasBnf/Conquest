"use client";

import { DatePicker } from "@/components/custom/date-picker";
import { MemberPicker } from "@/components/custom/member-picker";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { Task } from "@conquest/zod/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { v4 as uuid } from "uuid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateTask } from "./mutations/useCreateTask";
import {
  FormCreateTask,
  FormCreateTaskSchema,
} from "./schema/form-create-task.schema";

export const CreateTaskDialog = () => {
  const { data: session } = useSession();
  const { id, workspaceId } = session?.user ?? {};
  const [open, setOpen] = useState(false);

  const { data: users } = trpc.userInWorkspace.listUsers.useQuery();

  const form = useForm<FormCreateTask>({
    resolver: zodResolver(FormCreateTaskSchema),
    defaultValues: {
      title: "",
      dueDate: new Date(),
      assignee: id,
    },
  });

  const createTask = useCreateTask({ setOpen, reset: form.reset });

  const onSubmit = async ({
    title,
    dueDate,
    assignee,
    member,
  }: FormCreateTask) => {
    if (!id || !workspaceId || !dueDate) return;
    setOpen(false);
    form.reset();

    const task: Task = {
      id: uuid(),
      title,
      dueDate,
      assignee,
      isCompleted: false,
      memberId: member?.id ?? null,
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createTask(task);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        variant="transparent"
                        placeholder="Send onboarding message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter className="flex justify-between items-center">
              <div className="flex flex-1 gap-2 items-center">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Due Date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-8 bg-background">
                            <SelectValue placeholder="Assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="member"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MemberPicker
                          value={field.value ?? null}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 items-center">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button>Create</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
