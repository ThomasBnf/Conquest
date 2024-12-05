import { updateWorkflow } from "@/actions/workflows/updateWorkflow";
import { useGetWorkflow } from "@/queries/hooks/useGetWorkflow";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  type FormWorkflow,
  FormWorkflowSchema,
} from "./schemas/form-workflow.schema";

export const WorkflowPanel = () => {
  const pathname = usePathname();
  const id = pathname.split("/").at(-1) as string;
  const queryClient = useQueryClient();

  const { data: workflow } = useGetWorkflow({ workflow_id: id });

  const form = useForm<FormWorkflow>({
    resolver: zodResolver(FormWorkflowSchema),
    defaultValues: {
      name: workflow?.name ?? "",
      description: workflow?.description ?? "",
    },
  });

  const { mutate } = useMutation({
    mutationFn: updateWorkflow,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["workflow", id] });
    },
  });

  const onSubmit = async ({ name, description }: FormWorkflow) => {
    if (!workflow?.id) return;
    mutate({ id: workflow.id, name, description });
  };

  useEffect(() => {
    form.setValue("name", workflow?.name ?? "");
    form.setValue("description", workflow?.description ?? "");
  }, [workflow]);

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
