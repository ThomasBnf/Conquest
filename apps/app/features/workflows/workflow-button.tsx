"use client";

import { Button } from "@conquest/ui/button";
import { createWorkflow } from "actions/workflows/createWorkflow";
import { useUser } from "context/userContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const WorkflowButton = () => {
  const { slug } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateWorkflow = async () => {
    setLoading(true);
    const rWorkflow = await createWorkflow();
    const error = rWorkflow?.serverError;
    const workflow = rWorkflow?.data;

    if (error) {
      setLoading(false);
      return toast.error(error);
    }

    router.push(`/w/${slug}/workflows/${workflow?.id}`);
  };

  return (
    <Button loading={loading} onClick={handleCreateWorkflow}>
      <Plus size={16} />
      Create workflow
    </Button>
  );
};
