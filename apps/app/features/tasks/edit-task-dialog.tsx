"use client";

import { DatePicker } from "@/components/custom/date-picker";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { Skeleton } from "@conquest/ui/skeleton";
import { Task } from "@conquest/zod/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { useUpdateTask } from "./mutations/useUpdateTask";
import {
  FormEditTask,
  FormEditTaskSchema,
} from "./schema/form-edit-task.schema";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  task: Task;
};

export const EditTaskDialog = ({ open, setOpen, task }: Props) => {
  const { data: session } = useSession();
  const { id, workspaceId } = session?.user ?? {};
  const { title, dueDate, assignee, isCompleted, memberId } = task;

  const [search, setSearch] = useState("");
  const { ref, inView } = useInView();

  const updateTask = useUpdateTask({ task });

  const { data: member } = trpc.members.get.useQuery(
    memberId ? { id: memberId } : skipToken,
  );

  const { data: users } = trpc.userInWorkspace.listUsers.useQuery();
  const { data, isLoading, fetchNextPage } =
    trpc.members.listInfinite.useInfiniteQuery(
      { search },
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

  const members = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  const form = useForm<FormEditTask>({
    resolver: zodResolver(FormEditTaskSchema),
    defaultValues: {
      title,
      dueDate,
      assignee: assignee ?? null,
      member: member ?? null,
      isCompleted,
    },
  });

  const onSubmit = async ({
    title,
    dueDate,
    assignee,
    member,
    isCompleted,
  }: FormEditTask) => {
    if (!id || !workspaceId || !dueDate) return;

    const updatedTask: Task = {
      ...task,
      title,
      dueDate,
      assignee,
      isCompleted,
      memberId: member?.id ?? null,
    };

    await updateTask(updatedTask);
    setOpen(false);
    form.reset();
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="isCompleted"
                  render={({ field }) => (
                    <FormItem className="h-[20px]">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="size-[18px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          variant="transparent"
                          placeholder="Send onboarding message"
                          className="font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>
            <DialogFooter className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
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
                        <Popover modal>
                          <PopoverTrigger asChild>
                            <Button variant="outline">
                              {field.value ? (
                                <span>
                                  {field.value.firstName} {field.value.lastName}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Member
                                </span>
                              )}
                              <ChevronDown
                                size={16}
                                className="text-muted-foreground"
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0" align="start">
                            <Command loop shouldFilter={false}>
                              <CommandInput
                                placeholder="Search..."
                                value={search}
                                onValueChange={setSearch}
                              />
                              <CommandList>
                                <CommandGroup>
                                  {isLoading && (
                                    <Skeleton className="h-8 w-full" />
                                  )}
                                  {!isLoading && (
                                    <CommandEmpty>
                                      No members found
                                    </CommandEmpty>
                                  )}
                                  {members?.map((member) => (
                                    <CommandItem
                                      key={member.id}
                                      onSelect={() => {
                                        setOpen(false);
                                        field.onChange(member);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <Avatar className="size-7">
                                        <AvatarImage
                                          src={member.avatarUrl ?? ""}
                                        />
                                        <AvatarFallback className="text-sm">
                                          {member.firstName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                          {member.lastName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex w-full flex-col text-xs">
                                        {member.firstName} {member.lastName}
                                        <span className="text-muted-foreground">
                                          {member.primaryEmail}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                  <div ref={ref} />
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button>Save</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
