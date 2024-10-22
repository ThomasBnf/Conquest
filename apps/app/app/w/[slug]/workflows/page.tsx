import { IsPublished } from "@/features/workflows/isPublished";
import { WorkflowButton } from "@/features/workflows/workflow-button";
import { WorkflowMenu } from "@/features/workflows/workflow-menu";
import Link from "next/link";
import { listWorkflows } from "queries/workflows/listWorkflows";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Page({ params: { slug } }: Props) {
  const rWorkflows = await listWorkflows();
  const workflows = rWorkflows?.data;

  return (
    <div className="flex flex-col divide-y">
      <div className="flex h-12 items-center justify-between px-4">
        <p className="font-medium text-base">Workflows</p>
        <WorkflowButton />
      </div>
      <div>
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
      </div>
    </div>
  );
}
