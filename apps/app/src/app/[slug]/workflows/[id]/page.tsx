import { WorkflowProvider } from "@/context/workflowContext";
import { Flow } from "@/features/workflows/components/flow";
import { Header } from "@/features/workflows/components/header";
import { getWorkflow } from "@/queries/workflows/getWorkflow";
import { ReactFlowProvider } from "@xyflow/react";
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
      <Header workflow={workflow} />
      <ReactFlowProvider>
        <WorkflowProvider workflow={workflow}>
          <Flow />
        </WorkflowProvider>
      </ReactFlowProvider>
    </div>
  );
}
