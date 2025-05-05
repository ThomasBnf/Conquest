import { WorkflowPage } from "@/features/workflows/components/workflowPage";

type Props = {
  params: Promise<{ slug: string; workflowId: string }>;
};

export default async function Page({ params }: Props) {
  const { slug, workflowId } = await params;

  return <WorkflowPage slug={slug} workflowId={workflowId} />;
}
