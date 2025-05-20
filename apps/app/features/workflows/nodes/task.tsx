import { trpc } from "@/server/client";
import {
  Form,
  FormControl,
  FormDescription,
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
import { addDays, format } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNode } from "../hooks/useNode";
import { FormTask, FormTaskSchema } from "../panels/schemas/form-task.schema";

export const Task = () => {
  const { node } = useNode();
  const { updateNodeData } = useReactFlow();
  const { title, days, assignee } = NodeTaskSchema.parse(node?.data);

  const { data: users, failureReason } =
    trpc.userInWorkspace.listUsers.useQuery();

  console.log("users", users);
  console.log("failureReason", failureReason);

  const form = useForm<FormTask>({
    resolver: zodResolver(FormTaskSchema),
    defaultValues: {
      title,
      days,
      assignee,
    },
  });

  const daysValue = form.getValues("days");

  const onUpdateNodeData = () => {
    if (!node) return;

    updateNodeData(node?.id, {
      ...node.data,
      title: form.getValues("title"),
      days: form.getValues("days"),
      assignee: form.getValues("assignee"),
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

  const onChangeDays = (value: number) => {
    if (!node) return;

    form.setValue("days", Number(value));
    onUpdateNodeData();
  };

  useEffect(() => {
    if (!node) return;

    form.reset({
      title,
      days,
      assignee,
    });
  }, [node, users]);

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
          name="days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <div className="flex items-center divide-x overflow-hidden rounded-md border">
                  <div className="flex h-9 items-center bg-muted px-4">
                    <p>In</p>
                  </div>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    variant="transparent"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => onChangeDays(Number(e.target.value || 0))}
                    onBlur={onUpdateNodeData}
                  />
                  <div className="flex h-9 items-center bg-muted px-4">
                    <p>days</p>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                The due date is calculated from the trigger date.
                <br />
                For example: today + {daysValue} days ={" "}
                {format(addDays(new Date(), daysValue), "PP")}
              </FormDescription>
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
