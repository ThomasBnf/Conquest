import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateWorkflow } from "@/features/workflows/components/create-workflow";
import { IsPublished } from "@/features/workflows/components/isPublished";
import { WorkflowMenu } from "@/features/workflows/components/workflow-menu";
import { listWorkflows } from "@/features/workflows/functions/listWorkflows";
import { ScrollArea } from "@conquest/ui/scroll-area";
import Link from "next/link";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Page({ params: { slug } }: Props) {
  const rWorkflows = await listWorkflows();
  const workflows = rWorkflows?.data;

  return (
    <PageLayout>
      <Header title="Workflows" className="justify-between">
        <CreateWorkflow />
      </Header>
      <ScrollArea>
        {workflows?.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center justify-between border-b px-4 transition-colors hover:bg-muted-hover"
          >
            <Link
              href={`/${slug}/workflows/${workflow.id}`}
              className="flex flex-1 items-center h-12"
            >
              <p className="font-medium w-96 truncate">{workflow.name}</p>
            </Link>
            <div className="flex items-center gap-6">
              <IsPublished workflow={workflow} />
              <WorkflowMenu workflow={workflow} />
            </div>
          </div>
        ))}
      </ScrollArea>
    </PageLayout>
  );
}
