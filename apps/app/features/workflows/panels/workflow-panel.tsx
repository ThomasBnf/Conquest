import { trpc } from "@/server/client";
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
import { toast } from "sonner";
import {
  type FormWorkflow,
  FormWorkflowSchema,
} from "./schemas/form-workflow.schema";

type Props = {
  workflow: Workflow;
};

export const WorkflowPanel = ({ workflow }: Props) => {
  const { id, name, description } = workflow;
  const utils = trpc.useUtils();

  const form = useForm<FormWorkflow>({
    resolver: zodResolver(FormWorkflowSchema),
    defaultValues: {
      name,
      description,
    },
  });

  const { mutateAsync } = trpc.workflows.update.useMutation({
    onMutate: async () => {
      await utils.workflows.get.cancel();

      const previousWorkflow = utils.workflows.get.getData({ id });

      utils.workflows.get.setData({ id }, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          name: form.getValues().name,
          description: form.getValues().description ?? "",
        };
      });

      return { previousWorkflow };
    },
    onError: (error, __, context) => {
      utils.workflows.get.setData({ id }, context?.previousWorkflow);
      toast.error(error.message);
    },
    onSettled: () => {
      utils.workflows.get.invalidate({ id });
    },
  });

  const onSubmit = (data: FormWorkflow) => {
    mutateAsync({
      id,
      name: data.name,
      description: data.description ?? undefined,
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
