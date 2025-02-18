import { PageLayout } from "@/components/layouts/page-layout";
import { Editor } from "@/features/workflows/components/editor";
import { Header } from "@/features/workflows/components/header";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { getWorkflow } from "@conquest/db/queries/workflow/getWorkflow";
import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

type Props = {
  params: {
    workflowId: string;
  };
};

export default async function Page({ params: { workflowId } }: Props) {
  const { workspace_id } = await getCurrentUser();
  const workflow = await getWorkflow({ id: workflowId, workspace_id });

  if (!workflow) return redirect("/workflows");

  return (
    <PageLayout>
      <Header workflow_id={workflowId} />
      <ReactFlowProvider>
        <Editor workflow={workflow} />
      </ReactFlowProvider>
    </PageLayout>
  );
}
