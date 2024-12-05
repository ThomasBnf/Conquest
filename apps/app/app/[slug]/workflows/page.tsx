import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CreateWorkflow } from "@/features/workflows/components/create-workflow";
import { IsPublished } from "@/features/workflows/components/isPublished";
import { WorkflowMenu } from "@/features/workflows/components/workflow-menu";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { listWorkflows } from "@/queries/workflows/listWorkflows";
import { ScrollArea } from "@conquest/ui/scroll-area";
import Link from "next/link";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Page({ params: { slug } }: Props) {
  const { workspace_id } = await getCurrentUser();
  const workflows = await listWorkflows({ workspace_id });

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
              className="flex h-12 flex-1 items-center"
            >
              <p className="w-96 truncate font-medium">{workflow.name}</p>
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
