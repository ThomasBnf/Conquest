"use client";

import { Switch } from "@conquest/ui/switch";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Props = {
  workflow: Workflow;
};

export const IsPublished = ({ workflow }: Props) => {
  const [isPublished, setIsPublished] = useState(workflow.published);
  const queryClient = useQueryClient();

  const onTogglePublished = async () => {
    setIsPublished(!isPublished);
    // updateWorkflow({ id: workflow.id, published: !isPublished });
  };

  return (
    <div className="flex items-center gap-2">
      {isPublished ? (
        <div className="flex h-6 items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1">
          <div className="size-2.5 animate-pulse rounded-full bg-green-500" />
          <p className="text-green-700">Live</p>
        </div>
      ) : (
        <p className="flex h-6 items-center rounded-md border border-neutral-200 bg-neutral-100 px-1">
          Draft
        </p>
      )}
      <Switch checked={isPublished} onClick={onTogglePublished} />
    </div>
  );
};
