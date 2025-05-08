"use client";

import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { Editor } from "@/features/workflows/components/editor";
import { Header } from "@/features/workflows/components/header";
import { trpc } from "@/server/client";
import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

type Props = {
  slug: string;
  workflowId: string;
};

export const WorkflowPage = ({ slug, workflowId }: Props) => {
  const { data, isLoading } = trpc.workflows.get.useQuery({ id: workflowId });

  if (isLoading) return <IsLoading />;
  if (!data) redirect(`/${slug}/workflows`);

  return (
    <PageLayout>
      <Header slug={slug} workflow={data} />
      <ReactFlowProvider>
        <Editor workflow={data} />
      </ReactFlowProvider>
    </PageLayout>
  );
};
