import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateWorkflowButton } from "@/features/workflows/create-workflow-button";
import { IsPublished } from "@/features/workflows/isPublished";
import { listWorkflows } from "@/features/workflows/queries/listWorkflows";
import { WorkflowMenu } from "@/features/workflows/workflow-menu";
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
        <CreateWorkflowButton />
      </Header>
      <ScrollArea>
        {workflows?.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center justify-between border-b px-4 gap-6 transition-colors hover:bg-muted-hover"
          >
            <Link
              href={`/w/${slug}/workflows/${workflow.id}`}
              className="flex-1 h-14 flex items-center"
            >
              <p className="font-medium w-96 truncate">{workflow.name}</p>
            </Link>
            <IsPublished workflow={workflow} />
            <WorkflowMenu workflow={workflow} />
          </div>
        ))}
      </ScrollArea>
    </PageLayout>
  );
}
