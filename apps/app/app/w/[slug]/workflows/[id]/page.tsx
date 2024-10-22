import { Flow } from "@/features/workflows/flow";
import { Header } from "@/features/workflows/header";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowProvider } from "context/workflowContext";
import { redirect } from "next/navigation";
import { getWorkflow } from "queries/workflows/getWorkflow";

type Props = {
  params: {
    slug: string;
    id: string;
  };
};

export default async function Page({ params: { slug, id } }: Props) {
  const rWorkflow = await getWorkflow({ id });
  const workflow = rWorkflow?.data;

  if (!workflow) redirect(`/w/${slug}/workflows`);

  return (
    <div className="flex h-full w-full flex-col divide-y">
      <WorkflowProvider currentWorkflow={workflow}>
        <Header />
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </WorkflowProvider>
    </div>
  );
}
