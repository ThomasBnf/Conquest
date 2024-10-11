import { Icon } from "@/components/icons/Icon";
import { IsPublished } from "@/features/workflows/components/isPublished";
import { WorkflowButton } from "@/features/workflows/components/workflow-button";
import { listWorkflows } from "@/queries/workflows/listWorkflows";
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
    <div className="flex flex-col divide-y">
      <div className="flex h-12 items-center justify-between px-4">
        <p className="font-medium">Workflows</p>
        <WorkflowButton />
      </div>
      <div>
        {workflows?.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center justify-between border-b pr-4 transition-colors hover:bg-muted"
          >
            <Link
              href={`/${slug}/workflows/${workflow.id}`}
              className="flex-1 p-4"
            >
              <div className="flex items-center gap-2">
                <Icon
                  name={workflow.icon}
                  className="size-5 text-muted-foreground"
                />
                <p className="font-medium">{workflow.name}</p>
              </div>
              <p className="ml-7 text-muted-foreground">
                {workflow.description}
              </p>
            </Link>
            <IsPublished workflow={workflow} />
          </div>
        ))}
      </div>
    </div>
  );
}
