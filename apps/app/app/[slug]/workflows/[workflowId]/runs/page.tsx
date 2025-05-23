import { RunWorkflow } from "@/features/runs/run-workflow";

type Props = {
  params: Promise<{ workflowId: string }>;
};

export default async function Page({ params }: Props) {
  const { workflowId } = await params;

  return <RunWorkflow workflowId={workflowId} />;
}
