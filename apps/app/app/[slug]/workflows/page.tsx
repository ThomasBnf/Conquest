import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { AddWorkflow } from "@/features/workflows/components/add-workflow";
import { WorkflowsListPage } from "@/features/workflows/components/workflows-list-page";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return (
    <PageLayout>
      <Header title="Workflows">
        <AddWorkflow slug={slug} />
      </Header>
      <WorkflowsListPage slug={slug} />
    </PageLayout>
  );
}
