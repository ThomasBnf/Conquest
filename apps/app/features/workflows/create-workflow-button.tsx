"use client";

import { createWorkflow } from "@/features/workflows/actions/createWorkflow";
import { Button } from "@conquest/ui/button";
import { useUser } from "context/userContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const CreateWorkflowButton = () => {
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

    router.push(`/${slug}/workflows/${workflow?.id}`);
  };

  return (
    <Button loading={loading} onClick={handleCreateWorkflow}>
      <Plus size={16} />
      Create workflow
    </Button>
  );
};
