"use client";

import { useUser } from "@/context/userContext";
import { useWorkflow } from "@/context/workflowContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IsPublished } from "./isPublished";
import { type FormName, FormNameSchema } from "./panels/types/form-name.schema";
import { WorkflowMenu } from "./workflow-menu";

export const Header = () => {
  const { slug } = useUser();
  const { workflow, setWorkflow, onUpdateWorkflow } = useWorkflow();

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    defaultValues: {
      name: workflow?.name,
    },
  });

  const onSubmit = async ({ name }: FormName) => {
    await onUpdateWorkflow({ ...workflow, name });
  };

  useEffect(() => {
    form.setValue("name", workflow.name);
  }, [workflow]);

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${slug}/workflows`}>Workflows</Link>
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
      <div className="flex items-center gap-4">
        <IsPublished workflow={workflow} setWorkflow={setWorkflow} />
        <WorkflowMenu workflow={workflow} />
      </div>
    </div>
  );
};
