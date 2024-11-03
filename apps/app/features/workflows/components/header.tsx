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
import { Skeleton } from "@conquest/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { _getWorkflow } from "../actions/_getWorkflow";
import { _updateWorkflow } from "../actions/_updateWorkflow";
import {
  type FormName,
  FormNameSchema,
} from "../panels/types/form-name.schema";
import { IsPublished } from "./isPublished";
import { WorkflowMenu } from "./workflow-menu";

type Props = {
  id: string;
};

export const Header = ({ id }: Props) => {
  const { slug } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["workflow", id],
    queryFn: () => _getWorkflow({ id }),
  });

  const { mutate } = useMutation({
    mutationFn: _updateWorkflow,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["workflow", id] });
    },
  });

  const workflow = data?.data;

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    defaultValues: {
      name: workflow?.name,
    },
  });

  const onSubmit = async ({ name }: FormName) => {
    if (!workflow?.id) return;
    mutate({ id: workflow.id, name });
  };

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
              {isLoading ? (
                <Skeleton />
              ) : (
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
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {workflow && (
        <div className="flex items-center gap-4">
          <IsPublished workflow={workflow} />
          <WorkflowMenu workflow={workflow} />
        </div>
      )}
    </div>
  );
};
