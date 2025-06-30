"use client";

import { Switch } from "@conquest/ui/switch";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useUpdateWorkflow } from "../mutations/useUpdateWorkflow";

type Props = {
  workflow: Workflow;
  displaySwitch?: boolean;
};

export const IsPublished = ({ workflow, displaySwitch = true }: Props) => {
  const { published, archivedAt } = workflow;
  const updateWorkflow = useUpdateWorkflow();

  const onTogglePublished = async () => {
    await updateWorkflow({
      ...workflow,
      published: !published,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {archivedAt ? (
        <p className="flex h-6 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Archived
        </p>
      ) : published ? (
        <div className="flex h-6 items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1">
          <div className="relative size-2">
            <div className="absolute inset-0 size-2 rounded-full bg-green-500" />
            <div className="absolute inset-0 size-2 animate-ping rounded-full bg-green-500" />
          </div>
          <p className="text-green-700">Live</p>
        </div>
      ) : (
        <p className="flex h-6 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Draft
        </p>
      )}
      {displaySwitch && (
        <Switch checked={published} onClick={onTogglePublished} />
      )}
    </div>
  );
};
