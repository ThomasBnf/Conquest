"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import Link from "next/link";
import { EmptyWorkflows } from "./empty-workflows";
import { IsPublished } from "./isPublished";
import { WorkflowMenu } from "./workflow-menu";
type Props = {
  slug: string;
};

export const WorkflowsListPage = ({ slug }: Props) => {
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery();

  if (isLoading) return <IsLoading />;
  if (workflows?.length === 0) return <EmptyWorkflows slug={slug} />;

  return (
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
  );
};
