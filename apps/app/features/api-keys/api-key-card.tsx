"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import type { APIKey } from "@conquest/zod/schemas/apikey.schema";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  apiKey: APIKey;
};

export const ApiKeyCard = ({ apiKey }: Props) => {
  const [open, setOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.apiKeys.delete.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
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
    <>
      <AlertDialog
        title="Revoke API Key"
        description="Are you sure you want to revoke this API key?"
        open={open}
        setOpen={setOpen}
        buttonLabel="Revoke"
        onConfirm={() => onDelete(apiKey.id)}
      />
      <Card>
        <CardHeader>
          <CardTitle>{apiKey.name}</CardTitle>
        </CardHeader>
        <CardContent className="mb-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground">
              {isRevealed ? apiKey.token : apiKey.token.replace(/./g, "•")}
            </p>
            <div className="flex items-center gap-2">
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
              <Button
                variant="destructive"
                className="ml-2"
                onClick={() => setOpen(true)}
              >
                Revoke
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
