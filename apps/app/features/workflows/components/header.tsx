"use client";

import { EditableInput } from "@/components/editable/editable-input";
import { trpc } from "@/server/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type FormName,
  FormNameSchema,
} from "../panels/schemas/form-name.schema";
import { IsPublished } from "./isPublished";
import { WorkflowMenu } from "./workflow-menu";

type Props = {
  slug: string;
  workflow: Workflow;
};

export const Header = ({ slug, workflow }: Props) => {
  const { id, name } = workflow;
  const utils = trpc.useUtils();

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    defaultValues: {
      name,
    },
  });

  const { mutateAsync } = trpc.workflows.update.useMutation({
    onMutate: async () => {
      await utils.workflows.list.cancel();
      await utils.workflows.get.cancel();

      const previousWorkflows = utils.workflows.list.getData();
      const previousWorkflow = utils.workflows.get.getData({ id });

      utils.workflows.list.setData(undefined, (old) => {
        return old?.map((w) => (w.id === id ? { ...w, name } : w));
      });
      utils.workflows.get.setData({ id }, (old) => {
        if (!old) return undefined;
        return { ...old, name };
      });

      return { previousWorkflows, previousWorkflow };
    },
    onError: (error, __, context) => {
      utils.workflows.list.setData(undefined, context?.previousWorkflows);
      utils.workflows.get.setData({ id }, context?.previousWorkflow);
      toast.error(error.message);
    },
    onSettled: () => {
      utils.workflows.list.invalidate();
      utils.workflows.get.invalidate({ id });
    },
  });

  useEffect(() => {
    form.setValue("name", name);
  }, [name]);

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
              <EditableInput
                defaultValue={name}
                onUpdate={(name) => mutateAsync({ id, name })}
                copyable={false}
              />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-4">
        <IsPublished workflow={workflow} />
        <WorkflowMenu workflow={workflow} />
      </div>
    </div>
  );
};
