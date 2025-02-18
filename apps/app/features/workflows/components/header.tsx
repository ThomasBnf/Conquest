"use client";

import { useUser } from "@/context/userContext";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  type FormName,
  FormNameSchema,
} from "../panels/schemas/form-name.schema";
import { IsPublished } from "./isPublished";
import { WorkflowMenu } from "./workflow-menu";

type Props = {
  workflow_id: string;
};

export const Header = ({ workflow_id }: Props) => {
  const { slug } = useUser();
  const queryClient = useQueryClient();

  // const { data: workflow } = getWorkflow({ workflow_id });

  // const { mutate } = useMutation({
  //   mutationFn: updateWorkflow,
  //   onSuccess: () => {
  //     queryClient.refetchQueries({ queryKey: ["workflow", workflow_id] });
  //   },
  // });

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    // defaultValues: {
    //   name: workflow?.name,
    // },
  });

  const onSubmit = async ({ name }: FormName) => {
    // mutate({ id: workflow_id, name });
  };

  // useEffect(() => {
  //   form.setValue("name", workflow?.name ?? "");
  // }, [workflow]);

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
