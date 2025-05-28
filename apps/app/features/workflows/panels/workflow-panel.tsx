import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Switch } from "@conquest/ui/switch";
import { TextField } from "@conquest/ui/text-field";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateWorkflow } from "../mutations/useUpdateWorkflow";
import {
  type FormWorkflow,
  FormWorkflowSchema,
} from "./schemas/form-workflow.schema";

type Props = {
  workflow: Workflow;
};

export const WorkflowPanel = ({ workflow }: Props) => {
  const { name, description, alertOnSuccess, alertOnFailure } = workflow;
  const updateWorkflow = useUpdateWorkflow();

  const form = useForm<FormWorkflow>({
    resolver: zodResolver(FormWorkflowSchema),
    defaultValues: {
      name,
      description,
      alertOnSuccess,
      alertOnFailure,
    },
  });

  const onSubmit = ({
    name,
    description,
    alertOnSuccess,
    alertOnFailure,
  }: FormWorkflow) => {
    updateWorkflow({
      ...workflow,
      name,
      description: description ?? "",
      alertOnSuccess,
      alertOnFailure,
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Add a name"
                    onBlur={form.handleSubmit(onSubmit)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Add a description..."
                    onBlur={form.handleSubmit(onSubmit)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alertOnSuccess"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Community alert</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={() => {
                        field.onChange(!field.value);
                        form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
                <FormDescription>
                  Get notified by email when the workflow runs successfully.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alertOnFailure"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Workflow failure alert</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={() => {
                        field.onChange(!field.value);
                        form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
                <FormDescription>
                  Get notified by email when failures occur in runs of this
                  workflow.
                </FormDescription>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
};
