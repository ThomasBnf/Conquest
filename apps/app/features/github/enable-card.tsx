"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListRepos } from "./list-repos";

type Props = {
  error: string;
};

export const EnableCard = ({ error }: Props) => {
  const { slug, github } = useUser();
  const { trigger_token, trigger_token_expires_at } = github ?? {};
  const [loading, setLoading] = useState(github?.status === "SYNCING");
  const router = useRouter();

  const isEnabled = github?.status === "ENABLED";
  const isSyncing = github?.status === "SYNCING";
  const isConnected = github?.status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = () => {
    const params = new URLSearchParams({
      client_id: env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/github`,
      scope: "repo",
    });

    router.push(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  };

  const onDisconnect = async () => {
    if (!github) return;
    await deleteIntegration({ integration: github, source: "GITHUB" });
  };

  useEffect(() => {
    if (trigger_token_expires_at && trigger_token_expires_at < new Date()) {
      onDisconnect();
    }

    if (error) {
      switch (error) {
        case "invalid_code":
          toast.error("Error: Invalid code");
          break;
        case "already_connected":
          toast.error(
            "This Github account is already connected to another account",
            {
              duration: 10000,
            },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/github`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <Link
            href="https://docs.useconquest.com/github"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "link", size: "xs" }),
              "flex w-fit items-center gap-2 text-foreground",
            )}
          >
            <ExternalLink size={15} />
            <p>Documentation</p>
          </Link>
        </div>
        {(!trigger_token || isExpired) && (
          <Button onClick={onEnable}>
            <CirclePlus size={16} />
            Enable
          </Button>
        )}
        {/* {isEnabled && !loading && !isExpired && ( */}
        <Button variant="destructive" onClick={onDisconnect}>
          Disconnect
        </Button>
        {/* )} */}
      </CardHeader>
      <CardContent className="mb-0.5">
        <p className="font-medium text-base">Overview</p>
        <p className="text-balance text-muted-foreground">
          Connect your Github account to get a complete overview of your
          repositories.
        </p>
        {(isEnabled || isSyncing) && !isExpired && (
          <ListRepos loading={loading} setLoading={setLoading} />
        )}
      </CardContent>
    </Card>
  );
};
