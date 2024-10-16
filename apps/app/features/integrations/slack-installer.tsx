"use client";

import { updateIntegration } from "@/actions/integrations/updateIntegration";
import { oauthV2 } from "@/actions/slack/auth/oauthV2";
import { runSlack } from "@/actions/slack/runSlack";
import { IsLoading } from "@/components/states/is-loading";
import { useUser } from "@/context/userContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const SlackInstaller = () => {
  const { slug } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const scopes =
    "channels:history,channels:join,channels:read,files:read,groups:read,links:read,reactions:read,team:read,users:read,users:read.email";

  const onInstall = async () => {
    if (!code) return;
    console.log("onInstall", code);

    const rIntegration = await oauthV2({ code, scopes });
    const integration = rIntegration?.data;

    console.log(integration);

    if (integration) {
      router.replace(`/w/${slug}/settings/integrations/slack`);
      toast.success("Conquest installed on Slack");

      await Promise.all([
        updateIntegration({
          id: integration.id,
          installed_at: new Date(),
        }),
        runSlack({ id: integration.id }),
      ]);
    }
  };

  useEffect(() => {
    console.log("useEffect", code);
    onInstall();
  }, []);

  return <IsLoading />;
};
