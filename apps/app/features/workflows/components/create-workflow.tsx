"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  slug: string;
};

export const CreateWorkflow = ({ slug }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workflows.post.useMutation({
    onSuccess: ({ id }) => {
      utils.workflows.list.invalidate();
      router.push(`/${slug}/workflows/${id}`);
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const onCreateWorkflow = async () => {
    setLoading(true);
    await mutateAsync();
  };

  return (
    <Button onClick={onCreateWorkflow} disabled={loading}>
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
