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
import { Switch } from "@conquest/ui/switch";
import { NodeTaskSchema } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { addDays, format } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useWorkflow } from "../context/workflowContext";
import { FormTask, FormTaskSchema } from "../panels/schemas/form-task.schema";

export const Task = () => {
  const { node } = useWorkflow();
  const { updateNodeData } = useReactFlow();
  const { title, days, assignee, alertByEmail } = NodeTaskSchema.parse(
    node?.data,
  );

  const { data: users } = trpc.userInWorkspace.listUsers.useQuery();

  const form = useForm<FormTask>({
    resolver: zodResolver(FormTaskSchema),
    defaultValues: {
      title,
      days,
      assignee,
      alertByEmail,
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
      alertByEmail: form.getValues("alertByEmail"),
    });
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
      alertByEmail,
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
                <Input {...field} onBlur={onUpdateNodeData} />
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
                <div className="flex items-center overflow-hidden border divide-x rounded-md">
                  <div className="flex items-center px-4 h-9 bg-muted">
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
                  <div className="flex items-center px-4 h-9 bg-muted">
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
              <FormLabel>Assignee</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={onChangeAssignee}
                >
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
          name="alertByEmail"
          render={({ field }) => (
            <FormItem className="w-full">
              <div className="flex items-center justify-between">
                <FormLabel>Alert by email</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormDescription>
                If enabled, the assignee will receive an email when the task is
                created.
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
