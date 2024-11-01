import { Flow } from "@/features/workflows/components/flow";
import { Header } from "@/features/workflows/components/header";
import { getWorkflow } from "@/features/workflows/functions/getWorkflow";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowProvider } from "context/workflowContext";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    id: string;
  };
};

export default async function Page({ params: { slug, id } }: Props) {
  const rWorkflow = await getWorkflow({ id });
  const workflow = rWorkflow?.data;

  if (!workflow) redirect(`/${slug}/workflows`);

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
