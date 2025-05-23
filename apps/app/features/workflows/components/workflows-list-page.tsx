"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { EmptyWorkflows } from "./empty-workflows";
import { WorkflowItem } from "./workflow-item";

type Props = {
  slug: string;
};

export const WorkflowsListPage = ({ slug }: Props) => {
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery();

  if (isLoading) return <IsLoading />;
  if (workflows?.length === 0) return <EmptyWorkflows slug={slug} />;

  return (
    <ScrollArea>
      <div className="flex h-8 items-center justify-between border-b bg-surface px-4 text-muted-foreground">
        <div className="flex flex-1 items-center">
          <p className="flex-[2]">Workflow</p>
          <p className="flex-1">Runs</p>
          <p className="flex-1">Status</p>
          <p className="flex-1">Last run at</p>
          <p className="flex-1">Last failed at</p>
        </div>
        <div className="size-8" />
      </div>
      {workflows?.map((workflow) => (
        <WorkflowItem key={workflow.id} workflow={workflow} slug={slug} />
      ))}
    </ScrollArea>
  );
};
