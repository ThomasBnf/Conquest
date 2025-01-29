"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { Slack } from "@/components/icons/Slack";
import { SLACK_SCOPES, SLACK_USER_SCOPES } from "@/constant";
import { useUser } from "@/context/userContext";
import { env } from "@conquest/env";
import { Separator } from "@conquest/ui/separator";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SlackForm } from "../slack/slack-form";
import { ConnectedCard } from "./connected-card";
import { EnableCard } from "./enable-card";
import { IntegrationHeader } from "./integration-header";

type Props = {
  error: string;
  channels: Channel[];
};

export const SlackIntegration = ({ error, channels }: Props) => {
  const { slack } = useUser();
  const { name } = slack?.details ?? {};
  const [loading, setLoading] = useState(slack?.status === "SYNCING");
  const router = useRouter();

  const onEnable = () => {
    setLoading(true);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      scope: SLACK_SCOPES,
      user_scope: SLACK_USER_SCOPES,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/slack`,
    });

    router.push(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  };

  const onDisconnect = async () => {
    if (!slack) return;

    const response = await deleteIntegration({
      integration: slack,
      source: "SLACK",
    });
    const error = response?.serverError;

    setLoading(false);
    if (error) return toast.error(error);
    return toast.success("Slack disconnected");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Slack />
        </div>
        <p className="font-medium text-lg">Slack</p>
      </div>
      <EnableCard
        error={error}
        integration={slack}
        docUrl="https://docs.useconquest.com/integrations/slack"
        description="Connect your Slack community to get a complete overview of your members and community activity."
        loading={loading}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
      >
        <SlackForm loading={loading} setLoading={setLoading} />
      </EnableCard>
      <ConnectedCard
        integration={slack}
        name={name}
        onDisconnect={onDisconnect}
      >
        <>
          <Separator className="my-4" />
          <div>
            <p className="mb-2 font-medium">Channels</p>
            <div className="space-y-1">
              {channels?.map((channel) => (
                <div key={channel.id} className="flex items-center gap-1">
                  <Hash size={16} />
                  <p>{channel.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      </ConnectedCard>
    </div>
  );
};
