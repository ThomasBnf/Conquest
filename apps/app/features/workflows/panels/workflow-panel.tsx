"use client";

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
import { useWorkflow } from "context/workflowContext";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  type FormWorkflow,
  FormWorkflowSchema,
} from "./types/form-workflow.schema";

export const WorkflowPanel = () => {
  const { workflow, onUpdateWorkflow } = useWorkflow();

  const form = useForm<FormWorkflow>({
    resolver: zodResolver(FormWorkflowSchema),
    defaultValues: {
      name: workflow.name,
      description: workflow.description ?? "",
    },
  });

  const onSubmit = async ({ name, description }: FormWorkflow) => {
    await onUpdateWorkflow({ ...workflow, name, description });
  };

  useEffect(() => {
    form.setValue("name", workflow.name);
    form.setValue("description", workflow.description ?? "");
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
