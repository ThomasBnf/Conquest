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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { usePanel } from "../hooks/usePanel";
import { FormTask, FormTaskSchema } from "./schemas/form-task.schema";

export const Task = () => {
  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();

  const { task, assignee } = NodeTaskSchema.parse(node?.data);

  const { data: users } = trpc.userInWorkspace.listUsers.useQuery();

  const form = useForm<FormTask>({
    resolver: zodResolver(FormTaskSchema),
    defaultValues: {
      task,
      assignee,
    },
  });

  const onChangeTask = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!node) return;

    form.setValue("task", e.target.value);
  };

  const onChangeAssignee = (value: string) => {
    if (!node) return;

    form.setValue("assignee", value);

    onUpdateNodeData();
  };

  const onUpdateNodeData = () => {
    if (!node) return;

    updateNodeData(node?.id, {
      ...node.data,
      task: form.getValues("task"),
      assignee: form.getValues("assignee"),
    });
  };

  useEffect(() => {
    if (!node) return;

    form.reset({ task, assignee });
  }, [node]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="task"
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
      </form>
    </Form>
  );
};
