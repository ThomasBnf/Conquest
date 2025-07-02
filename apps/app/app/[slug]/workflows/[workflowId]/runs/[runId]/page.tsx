import { RunWorkflow } from "@/features/runs/run-workflow";

type Props = {
  params: Promise<{ workflowId: string; runId: string }>;
};

export default async function Page({ params }: Props) {
  const { workflowId, runId } = await params;

  return <RunWorkflow workflowId={workflowId} runId={runId} />;
}
