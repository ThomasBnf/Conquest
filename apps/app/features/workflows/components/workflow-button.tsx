"use client";

import { Button } from "@conquest/ui/button";
import { createWorkflow } from "actions/workflows/createWorkflow";
import { useUser } from "context/userContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const WorkflowButton = () => {
  const { slug } = useUser();
  const router = useRouter();

  const handleCreateWorkflow = async () => {
    const rWorkflow = await createWorkflow();
    const workflow = rWorkflow?.data;

    router.push(`/${slug}/workflows/${workflow?.id}`);
  };

  return (
    <Button onClick={handleCreateWorkflow}>
      <Plus size={16} />
      Create workflow
    </Button>
  );
};
