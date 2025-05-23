"use client";

import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { Editor } from "@/features/workflows/components/editor";
import { Header } from "@/features/workflows/components/header";
import { trpc } from "@/server/client";
import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";
import { WorkflowProvider } from "../context/workflowContext";
import { WorkflowTabs } from "./workflow-tabs";

type Props = {
  slug: string;
  workflowId: string;
};

export const WorkflowEditor = ({ slug, workflowId }: Props) => {
  const { data, isLoading } = trpc.workflows.get.useQuery({ id: workflowId });

  if (isLoading) return <IsLoading />;
  if (!data) redirect(`/${slug}/workflows`);

  return (
    <PageLayout>
      <Header workflow={data} />
      <WorkflowTabs workflowId={workflowId} />
      <WorkflowProvider>
        <ReactFlowProvider>
          <Editor workflow={data} />
        </ReactFlowProvider>
      </WorkflowProvider>
    </PageLayout>
  );
};
