"use client";

import { runWorkflow } from "@/actions/workflows/runWorkflow";
import { updateWorkflow } from "@/actions/workflows/updateWorkflow";
import { useUser } from "@/context/userContext";
import type { Workflow } from "@/schemas/workflow.schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { Button } from "@conquest/ui/button";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type FormName, FormNameSchema } from "./panels/types/form-name.schema";

type Props = {
  workflow: Workflow;
};

export const Header = ({ workflow }: Props) => {
  const { slug } = useUser();

  const onRunWorkflow = async () => {
    await runWorkflow({ id: workflow.id });
  };

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    defaultValues: {
      name: workflow?.name,
    },
  });

  const onSubmit = async ({ name }: FormName) => {
    if (name === workflow.name) return;

    const rWorkflow = await updateWorkflow({
      id: workflow.id,
      nodes: workflow.nodes,
      name,
    });

    if (rWorkflow?.data) {
      return toast.success("Workflow name updated");
    }
    return toast.error("Failed to update workflow name");
  };

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${slug}/workflows`}>
              Workflows
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="h-8 w-80"
                            onBlur={() => {
                              form.handleSubmit(onSubmit)();
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button onClick={onRunWorkflow}>Try Workflow</Button>
    </div>
  );
};
