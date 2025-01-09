"use client";

import { useUser } from "@/context/userContext";
import { InstallForm } from "@/features/discourse/install-form";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CircleCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  error: string;
};

export const EnabledCard = ({ error }: Props) => {
  const { slug, discourse } = useUser();
  const { trigger_token, trigger_token_expires_at } = discourse ?? {};

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    setLoading(true);
    router.push("/connect/discourse");
  };

  useEffect(() => {
    router.refresh();
    if (error) {
      switch (error) {
        case "invalid_code":
          toast.error("Error: Invalid code");
          break;
        case "already_connected":
          toast.error(
            "This Discourse workspace is already connected to another account",
            {
              duration: 10000,
            },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/discourse`);
    }
  }, [error]);

  if (discourse?.status === "CONNECTED") return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex w-full items-center justify-between">
          <Link
            href="https://doc.useconquest.com/discourse"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "link", size: "xs" }),
              "flex w-fit items-center gap-2 text-foreground",
            )}
          >
            <ExternalLink size={15} />
            <p>Documentation</p>
          </Link>
          {(!trigger_token || isExpired) && (
            <Button onClick={onEnable} loading={loading} disabled={loading}>
              <CircleCheck size={16} />
              Enable
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="mb-0.5 space-y-4">
        <div>
          <p className="font-medium text-base">Overview</p>
          <p className="text-balance text-muted-foreground">
            Connect your Discourse workspace to automatically sync messages,
            collect member interactions, and send personalized direct messages
            through automated workflows.
          </p>
        </div>
        {(discourse?.status === "ENABLED" || discourse?.status === "SYNCING") &&
          !isExpired && <InstallForm />}
      </CardContent>
    </Card>
  );
};
