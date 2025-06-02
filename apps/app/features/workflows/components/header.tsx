"use client";

import { EditableInput } from "@/components/editable/editable-input";
import { useGetSlug } from "@/hooks/useGetSlug";
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
import { useUpdateWorkflow } from "../mutations/useUpdateWorkflow";
import {
  type FormName,
  FormNameSchema,
} from "../panels/schemas/form-name.schema";
import { IsPublished } from "./is-published";
import { WorkflowMenu } from "./workflow-menu";

type Props = {
  workflow: Workflow;
};

export const Header = ({ workflow }: Props) => {
  const { name } = workflow;
  const slug = useGetSlug();
  const updateWorkflow = useUpdateWorkflow();

  const form = useForm<FormName>({
    resolver: zodResolver(FormNameSchema),
    defaultValues: {
      name,
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
                onUpdate={(name) => updateWorkflow({ ...workflow, name })}
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
