"use client";

import { DeleteDialog } from "@/components/custom/delete-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import type { APIKey } from "@conquest/zod/schemas/apikey.schema";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  apiKey: APIKey;
};

export const ApiKeyCard = ({ apiKey }: Props) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { mutateAsync } = trpc.apiKeys.deleteApiKey.useMutation({
    onSuccess: () => {
      toast.success("API key revoked");
    },
  });

  const onCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(apiKey.token);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    toast.success("Copied to clipboard");
  };

  const onDelete = async (id: string) => {
    await mutateAsync({ id });
  };

  return (
    <div className="rounded-md border bg-muted p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{apiKey.name}</p>
        <DeleteDialog
          title="Revoke API Key"
          description="Are you sure you want to revoke this API key?"
          onConfirm={() => onDelete(apiKey.id)}
        >
          Revoke
        </DeleteDialog>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">
          {isRevealed ? apiKey.token : apiKey.token.replace(/./g, "•")}
        </p>
        <Button
          onClick={() => setIsRevealed(!isRevealed)}
          variant="outline"
          size="icon"
        >
          {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
        <Button onClick={onCopy} variant="outline" size="icon">
          {isCopied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={13} />
          )}
        </Button>
      </div>
    </div>
  );
};
