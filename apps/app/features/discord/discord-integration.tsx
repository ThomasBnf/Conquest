"use client";

import { LoadingChannels } from "@/components/states/loading-channels";
import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { env } from "@conquest/env";
import { Discord } from "@conquest/ui/icons/Discord";
import { Separator } from "@conquest/ui/separator";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { DiscordForm } from "./discord-form";

type Props = {
  error: string;
};

export const DiscordIntegration = ({ error }: Props) => {
  const { discord, channels, setLoading } = useIntegration();
  const { name } = discord?.details ?? {};
  const router = useRouter();

  const onEnable = () => {
    setLoading(true);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      permissions: DISCORD_PERMISSIONS,
      redirect_uri: `${env.NEXT_PUBLIC_URL}/connect/discord`,
    });

    router.push(
      `https://discord.com/oauth2/authorize?${params.toString()}&scope=${DISCORD_SCOPES}`,
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Discord />
        </div>
        <p className="font-medium text-lg">Discord</p>
      </div>
      <EnableCard
        error={error}
        integration={discord}
        docUrl="https://docs.useconquest.com/integrations/discord"
        description="Connect your Discord community to get a complete overview of your members and community activity."
        source="Discord"
        onEnable={onEnable}
      >
        <DiscordForm />
      </EnableCard>
      <ConnectedCard integration={discord} name={name}>
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
