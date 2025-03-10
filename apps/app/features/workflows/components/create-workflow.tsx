"use client";

import { useUser } from "@/context/userContext";
import { Button } from "@conquest/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const CreateWorkflow = () => {
  const { slug } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateWorkflow = async () => {
    // setLoading(true);
    // const rWorkflow = await createWorkflow();
    // const error = rWorkflow?.serverError;
    // const workflow = rWorkflow?.data;
    // if (error) {
    //   setLoading(false);
    //   return toast.error(error);
    // }
    // router.push(`/${slug}/workflows/${workflow?.id}`);
  };

  return (
    <Button onClick={handleCreateWorkflow}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Plus size={16} />
          Create workflow
        </>
      )}
    </Button>
  );
};
