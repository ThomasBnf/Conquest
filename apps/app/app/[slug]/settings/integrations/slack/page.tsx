"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { updateIntegration } from "@/actions/integrations/updateIntegration";
import { DeleteDialog } from "@/components/custom/delete-dialog";
import { env } from "@/env.mjs";
import { buttonVariants } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { oauthV2 } from "actions/slack/auth/oauthV2";
import { runSlack } from "actions/slack/runSlack";
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

  const scopes =
    "channels:history,channels:join,channels:read,files:read,groups:read,links:read,reactions:read,team:read,users:read,users:read.email";

  const onInstall = async () => {
    if (code) {
      const rIntegration = await oauthV2({ code, scopes });
      const integration = rIntegration?.data;

      if (integration) {
        router.replace(`/${slug}/settings/integrations/slack`);
        toast.success("Conquest installed on Slack");

        Promise.all([
          updateIntegration({
            id: integration.id,
            installed_at: new Date(),
          }),
          runSlack({ id: integration.id }),
        ]);
      }
    }
  };

  const onUninstall = async () => {
    if (!slack?.id) return;
    deleteIntegration({ id: slack.id });
    return toast.success("Slack disconnected");
  };

  useEffect(() => {
    if (code !== null) {
      onInstall();
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
            <Image src="/social/slack.svg" alt="Slack" width={24} height={24} />
          </div>
          <div>
            <p className="text-lg font-medium">Slack</p>
            <p className="text-muted-foreground">
              Synchronize your contacts with Slack
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
              <Link
                href={`https://slack.com/oauth/v2/authorize?client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=https://app.useconquest.com/${slug}/settings/integrations/slack`}
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Install
              </Link>
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
