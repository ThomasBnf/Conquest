"use client";

import { DeleteDialog } from "@/components/custom/delete-dialog";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { disconnectIntegration } from "@/features/integrations/actions/disconnectIntegration";
import { oauthV2 } from "@/features/slack/actions/oauthV2";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { slug, slack } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const user_scope = "chat:write,im:write,channels:write";
  const scopes =
    "channels:history,channels:join,channels:read,files:read,groups:history,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";

  const onStartInstall = () => {
    setLoading(true);
    const baseUrl = "https://slack.com/oauth/v2/authorize";
    const clientId = `client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}`;
    const scopesParams = `scope=${scopes}`;
    const userScopeParams = `user_scope=${user_scope}`;
    const redirectURI = `redirect_uri=${encodeURIComponent(`${env.NEXT_PUBLIC_SLACK_REDIRECT_URI}/${slug}/settings/integrations/slack`)}`;

    router.push(
      `${baseUrl}?${clientId}&${scopesParams}&${userScopeParams}&${redirectURI}`,
    );
    setLoading(false);
  };

  const onUninstall = async () => {
    if (!slack?.id) return;
    setLoading(true);
    await disconnectIntegration({ integration: slack });
    setLoading(false);
    return toast.success("Slack disconnected");
  };

  useEffect(() => {
    if (code) oauthV2({ code, scopes });
  }, [code]);

  return (
    <div className="mx-auto max-w-3xl py-16">
      <Link
        href={`/${slug}/settings/integrations`}
        className={cn(
          buttonVariants({ variant: "link", size: "xs" }),
          "flex w-fit items-center gap-1 text-foreground",
        )}
      >
        <ArrowLeft size={16} />
        <p>Integrations</p>
      </Link>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border p-3">
            <Image src="/social/slack.svg" alt="Slack" width={24} height={24} />
          </div>
          <div>
            <p className="text-lg font-medium">Slack</p>
            <p className="text-muted-foreground">
              Synchronize your members with Slack
            </p>
          </div>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted">
            <div className="flex items-center gap-4">
              <Link
                href="https://docs.useconquest.com/slack"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Documentation</p>
              </Link>
              <Link
                href="https://slack.com"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                slack.com
              </Link>
            </div>
            {!slack?.id && (
              <Button
                loading={slack?.status === "SYNCING" || loading}
                className={cn(buttonVariants({ variant: "default" }))}
                onClick={onStartInstall}
              >
                Install
              </Button>
            )}
            {slack?.status === "DISCONNECTED" && (
              <Button loading={loading} onClick={onStartInstall}>
                Install
              </Button>
            )}
            {slack?.status === "SYNCING" && (
              <Button
                loading={true}
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Installing...
              </Button>
            )}
            {slack?.status === "CONNECTED" && slack?.installed_at && (
              <DeleteDialog
                title="Disconnect Slack"
                description="Integrations will be removed from your workspace and all your data will be lost."
                onConfirm={onUninstall}
              >
                Uninstall
              </DeleteDialog>
            )}
          </div>
          <Separator />
          <div className="p-4">
            <p className="font-medium">Overview</p>
            <p className="text-muted-foreground">
              The Slack integration makes it easy to get messages, replies,
              reactions into Conquest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
