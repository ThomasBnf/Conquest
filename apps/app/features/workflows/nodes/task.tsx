import { DatePicker } from "@/components/custom/date-picker";
import { MemberPicker } from "@/components/custom/member-picker";
import {
  FormCreateTask,
  FormCreateTaskSchema,
} from "@/features/tasks/schema/form-create-task.schema";
import { trpc } from "@/server/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { NodeTaskSchema } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { usePanel } from "../hooks/usePanel";

export const Task = () => {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();
  const { task, assignee } = NodeTaskSchema.parse(node?.data);

  const { data: users } = trpc.userInWorkspace.listUsers.useQuery();

  const form = useForm<FormCreateTask>({
    resolver: zodResolver(FormCreateTaskSchema),
    defaultValues: {
      title: task,
      dueDate: new Date(),
      assignee: assignee ?? user?.id,
      member: undefined,
    },
  });

  const onUpdateNodeData = () => {
    if (!node) return;

    updateNodeData(node?.id, {
      ...node.data,
      title: form.getValues("title"),
      dueDate: form.getValues("dueDate"),
      assignee: form.getValues("assignee"),
      member: form.getValues("member"),
    });
  };

  const onChangeTask = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!node) return;

    form.setValue("title", e.target.value);
    onUpdateNodeData();
  };

  const onChangeAssignee = (value: string) => {
    if (!node) return;

    form.setValue("assignee", value);
    onUpdateNodeData();
  };

  const onChangeDueDate = (value: Date | undefined) => {
    if (!node || !value) return;

    form.setValue("dueDate", value);
    onUpdateNodeData();
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={onChangeTask}
                  onBlur={onUpdateNodeData}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={onChangeDueDate}
                  className="w-full justify-start"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee (optional)</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={onChangeAssignee}>
                  <SelectTrigger>
                    <SelectValue />
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="member"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member</FormLabel>
              <FormControl>
                <MemberPicker value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
