"use client";

import { LoadingChannels } from "@/components/states/loading-channels";
import { SLACK_SCOPES, SLACK_USER_SCOPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { env } from "@conquest/env";
import { Slack } from "@conquest/ui/icons/Slack";
import { Separator } from "@conquest/ui/separator";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { SlackForm } from "./slack-form";

type Props = {
  error: string;
};

export const SlackIntegration = ({ error }: Props) => {
  const { slack, channels, setLoading } = useIntegration();
  const { name } = slack?.details ?? {};
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
        source="Slack"
        onEnable={onEnable}
      >
        <SlackForm />
      </EnableCard>
      <ConnectedCard integration={slack} name={name}>
        <>
          <Separator className="my-4" />
          <div>
            <p className="mb-2 font-medium">Channels</p>
            <div className="space-y-1">
              {!channels?.length ? (
                <LoadingChannels />
              ) : (
                channels?.map((channel) => (
                  <div key={channel.id} className="flex items-center gap-1">
                    <Hash size={16} />
                    <p>{channel.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      </ConnectedCard>
    </div>
  );
};
