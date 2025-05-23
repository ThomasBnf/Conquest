import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
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
  const { name, description } = workflow;
  const updateWorkflow = useUpdateWorkflow();

  const form = useForm<FormWorkflow>({
    resolver: zodResolver(FormWorkflowSchema),
    defaultValues: {
      name,
      description,
    },
  });

  const onSubmit = ({ name, description }: FormWorkflow) => {
    updateWorkflow({
      ...workflow,
      name,
      description: description ?? "",
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
        </form>
      </Form>
    </>
  );
};
