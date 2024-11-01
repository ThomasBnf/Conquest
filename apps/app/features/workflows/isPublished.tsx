"use client";

import { updateWorkflow } from "@/features/workflows/actions/updateWorkflow";
import { Switch } from "@conquest/ui/switch";
import type { Workflow } from "@conquest/zod/workflow.schema";
import { type Dispatch, type SetStateAction, useState } from "react";

type Props = {
  workflow: Workflow;
  setWorkflow?: Dispatch<SetStateAction<Workflow>>;
};

export const IsPublished = ({ workflow, setWorkflow }: Props) => {
  const [isPublished, setIsPublished] = useState(workflow.published);

  const onTogglePublished = async () => {
    setIsPublished(!isPublished);
    setWorkflow?.({ ...workflow, published: !isPublished });

    await updateWorkflow({
      id: workflow.id,
      published: !isPublished,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isPublished ? (
        <div className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-100 px-1 h-6">
          <div className="size-2.5 rounded-full bg-green-500" />
          <p className="text-green-700">Live</p>
        </div>
      ) : (
        <p className="flex h-6 items-center rounded-lg border border-neutral-200 bg-neutral-100 px-1">
          Draft
        </p>
      )}
      <Switch checked={isPublished} onClick={onTogglePublished} />
    </div>
  );
};
