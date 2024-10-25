"use client";

import { DeleteDialog } from "@/components/custom/delete-dialog";
import { env } from "@/env.mjs";
import { deleteIntegrationAction } from "@/features/integrations/actions/deleteIntegrationAction";
import { updateIntegrationAction } from "@/features/integrations/actions/updateIntegrationAction";
import { installSlack } from "@/features/slack/actions/installSlack";
import { oauthV2 } from "@/features/slack/actions/oauthV2";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { useUser } from "context/userContext";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  const { slug, slack } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const loading = params.get("loading");
  const scopes =
    "channels:history,channels:join,channels:read,files:read,groups:read,links:read,reactions:read,team:read,users.profile:read,users:read,users:read.email";

  const onStartInstall = () => {
    const baseUrl = "https://slack.com/oauth/v2/authorize";
    const clientId = `client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}`;
    const scopesSlack = `scope=${scopes}`;
    const redirectUri = `redirect_uri=${encodeURIComponent(`${env.NEXT_PUBLIC_SLACK_REDIRECT_URI}/${slug}/settings/integrations/slack?loading=true`)}`;

    const url = `${baseUrl}?${clientId}&${scopesSlack}&${redirectUri}`;
    router.push(url);
  };

  const onInstall = async () => {
    if (!code) return;

    const installPromise = async () => {
      const rIntegration = await oauthV2({ code, scopes });
      const integration = rIntegration?.data;

      if (integration) {
        router.replace(`/${slug}/settings/integrations/slack`);
        await installSlack({ id: integration.id });
        await updateIntegrationAction({
          id: integration.id,
          installed_at: new Date(),
        });
        return integration;
      }
      throw new Error("Installation failed");
    };

    toast.promise(installPromise, {
      loading: "Installing Conquest on Slack...",
      success: "Conquest installed on Slack",
      error: "Failed to install Conquest on Slack",
    });
  };

  const onUninstall = async () => {
    if (!slack?.id) return;
    deleteIntegrationAction({ id: slack.id });
    return toast.success("Slack disconnected");
  };

  useEffect(() => {
    onInstall();
  }, []);

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
            <Image src="/social/slack.svg" alt="Slack" width={24} height={24} />
          </div>
          <div>
            <p className="text-lg font-medium">Slack</p>
            <p className="text-muted-foreground">
              Synchronize your members with Slack
            </p>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
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
            {slack?.installed_at ? (
              <DeleteDialog
                title="Disconnect Slack"
                description="Integrations will be removed from your workspace and all your data will be lost."
                onConfirm={onUninstall}
              >
                Uninstall
              </DeleteDialog>
            ) : (
              <Button
                loading={loading === "true"}
                className={cn(buttonVariants({ variant: "default" }))}
                onClick={onStartInstall}
              >
                Install
              </Button>
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
