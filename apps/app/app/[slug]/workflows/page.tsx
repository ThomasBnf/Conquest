import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateWorkflow } from "@/features/workflows/components/create-workflow";
import { WorkflowsListPage } from "@/features/workflows/components/workflowsListPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return (
    <PageLayout>
      <Header title="Workflows">
        <CreateWorkflow slug={slug} />
      </Header>
      <WorkflowsListPage slug={slug} />
    </PageLayout>
  );
}
