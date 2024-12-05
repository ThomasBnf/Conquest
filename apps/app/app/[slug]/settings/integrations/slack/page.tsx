"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { DeleteDialog } from "@/components/custom/delete-dialog";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { oauthV2 } from "@/features/slack/actions/oauthV2";
import { ChannelsList } from "@/features/slack/components/channel-list";
import { SCOPES } from "@/features/slack/constant/scopes";
import { USER_SCOPES } from "@/features/slack/constant/user-scopes";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  searchParams: {
    code: string | null;
  };
};

export default function Page({ searchParams: { code } }: Props) {
  const { slug, slack } = useUser();
  const [loading, setLoading] = useState(!!code);
  const router = useRouter();

  const onStartInstall = () => {
    const baseUrl = "https://slack.com/oauth/v2/authorize";
    const clientId = `client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}`;
    const scopesParams = `scope=${SCOPES}`;
    const userScopeParams = `user_scope=${USER_SCOPES}`;
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

    const rAuth = await oauthV2({ code, scopes: SCOPES });
    const error = rAuth?.serverError;

    if (error) {
      toast.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (code) onAuth();
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
