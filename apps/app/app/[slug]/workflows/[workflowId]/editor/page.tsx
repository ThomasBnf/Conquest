import { WorkflowEditor } from "@/features/workflows/components/workflow-editor";

type Props = {
  params: Promise<{ slug: string; workflowId: string }>;
};

export default async function Page({ params }: Props) {
  const { slug, workflowId } = await params;

  return <WorkflowEditor slug={slug} workflowId={workflowId} />;
}
