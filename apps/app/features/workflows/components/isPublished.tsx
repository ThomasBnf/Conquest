"use client";

import { Switch } from "@conquest/ui/switch";
import { publishWorkflow } from "actions/workflows/pusblishWork";
import type { Workflow } from "schemas/workflow.schema";

type Props = {
  workflow: Workflow;
};

export const IsPublished = ({ workflow }: Props) => {
  const onTogglePublished = async () => {
    await publishWorkflow({
      id: workflow.id,
      isPublished: !workflow.isPublished,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {workflow.isPublished ? (
        <div className="flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1">
          <div className="size-2.5 rounded-full bg-green-500" />
          <p className="text-green-700">Live</p>
        </div>
      ) : (
        <p className="flex h-5 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Draft
        </p>
      )}
      <Switch checked={workflow.isPublished} onClick={onTogglePublished} />
    </div>
  );
};
