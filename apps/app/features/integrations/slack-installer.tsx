"use client";

import { IsLoading } from "@/components/states/is-loading";
import { useUser } from "@/context/userContext";
import { installSlack } from "@/features/slack/actions/installSlack";
import { oauthV2 } from "@/features/slack/actions/oauthV2";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { updateIntegrationAction } from "./actions/updateIntegrationAction";

export const SlackInstaller = () => {
  const { slug } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const scopes =
    "channels:history,channels:join,channels:read,files:read,groups:read,links:read,reactions:read,team:read,users:read,users:read.email,users.profile:read";

  const onInstall = async () => {
    if (!code) return;

    const rIntegration = await oauthV2({ code, scopes });
    const integration = rIntegration?.data;

    if (integration) {
      router.replace(`/w/${slug}/settings/integrations/slack`);
      toast.success("Conquest installed on Slack");

      installSlack({ id: integration.id });
      updateIntegrationAction({ id: integration.id, installed_at: new Date() });
    }
  };

  useEffect(() => {
    onInstall();
  }, [code]);

  return <IsLoading />;
};
