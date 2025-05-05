"use client";

import { trpc } from "@/server/client";
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
import {
  type FormName,
  FormNameSchema,
} from "../panels/schemas/form-name.schema";

type Props = {
  slug: string;
  workflowId: string;
};

export const Header = ({ slug, workflowId }: Props) => {
  const { data: workflow } = trpc.workflows.get.useQuery({ id: workflowId });

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    defaultValues: {
      name: workflow?.name,
    },
  });

  const onSubmit = async ({ name }: FormName) => {};

  useEffect(() => {
    form.setValue("name", workflow?.name ?? "");
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
      {/* {workflow && (
        <div className="flex items-center gap-4">
          <IsPublished workflow={workflow} />
          <WorkflowMenu workflow={workflow} />
        </div>
      )} */}
    </div>
  );
};
