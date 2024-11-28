"use client";

import { DeleteDialog } from "@/components/custom/delete-dialog";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { deleteIntegration } from "@/features/integrations/actions/deleteIntegration";
import { oauthV2 } from "@/features/slack/actions/oauthV2";
import { ChannelsList } from "@/features/slack/components/channel-list";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
    const baseUrl = "https://slack.com/oauth/v2/authorize";
    const clientId = `client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}`;
    const scopesParams = `scope=${scopes}`;
    const userScopeParams = `user_scope=${user_scope}`;
    const redirectURI = `redirect_uri=${encodeURIComponent(`${env.NEXT_PUBLIC_SLACK_REDIRECT_URI}/${slug}/settings/integrations/slack`)}`;

    router.push(
      `${baseUrl}?${clientId}&${scopesParams}&${userScopeParams}&${redirectURI}`,
    );
  };

  const onUninstall = async () => {
    if (!slack?.id) return;

    await deleteIntegration({
      integration: slack,
      source: "SLACK",
    });
    return toast.success("Slack disconnected");
  };

  const onAuth = async () => {
    if (!code) return;

    const rAuth = await oauthV2({ code, scopes });
    const error = rAuth?.serverError;

    if (error) {
      toast.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (code) {
      setLoading(true);
      onAuth();
    }
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
          <div className="rounded-md border p-3">
            <Slack />
          </div>
          <div>
            <p className="font-medium text-lg">Slack</p>
            <p className="text-muted-foreground">
              Sync your Slack workspace with Conquest
            </p>
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
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
            {slack?.id ? (
              <DeleteDialog
                title="Uninstall Slack"
                description="Slack integration will be removed from your workspace and all your data will be deleted."
                onConfirm={onUninstall}
              >
                Uninstall
              </DeleteDialog>
            ) : (
              <Button loading={loading} onClick={onStartInstall}>
                Install
              </Button>
            )}
          </CardHeader>
          <CardContent className="mb-0.5 p-0">
            <div className="p-4">
              <p className="font-medium text-base">Overview</p>
              <p className="text-balance text-muted-foreground">
                Connect your Slack workspace to automatically sync messages,
                collect member interactions, and send personalized direct
                messages through automated workflows.
              </p>
            </div>
            {slack?.id && slack?.status !== "INSTALLED" && <ChannelsList />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
