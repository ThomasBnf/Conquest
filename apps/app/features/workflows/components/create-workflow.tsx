"use client";

import { useUser } from "@/context/userContext";
import { _createWorkflow } from "@/features/workflows/actions/_createWorkflow";
import { Button } from "@conquest/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const CreateWorkflow = () => {
  const { slug } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateWorkflow = async () => {
    setLoading(true);

    const rWorkflow = await _createWorkflow();
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
