"use client";

import { deleteApiKey } from "@/actions/api-keys/deleteApiKey";
import type { APIKey } from "@/schemas/apikey.schema";
import { Button } from "@conquest/ui/button";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  apiKey: APIKey;
};

export const ApiKey = ({ apiKey }: Props) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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
    await deleteApiKey({ id });
  };

  return (
    <div className="rounded-md border bg-muted p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{apiKey.name}</p>
        <Button onClick={() => onDelete(apiKey.id)} variant="outline">
          Revoke
        </Button>
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
          {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
        </Button>
        <Button onClick={onCopy} variant="outline" size="icon">
          {isCopied ? (
            <Check size={15} className="text-green-500" />
          ) : (
            <Copy size={13} />
          )}
        </Button>
      </div>
    </div>
  );
};
