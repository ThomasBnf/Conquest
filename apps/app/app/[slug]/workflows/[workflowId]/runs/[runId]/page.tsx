import { RunWorkflow } from "@/features/runs/run-workflow";

type Props = {
  params: Promise<{ slug: string; workflowId: string; runId: string }>;
};

export default async function Page({ params }: Props) {
  const { slug, workflowId, runId } = await params;

  return <RunWorkflow workflowId={workflowId} runId={runId} />;
}
