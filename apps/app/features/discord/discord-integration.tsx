"use client";

import { Discord } from "@/components/icons/Discord";
import { SkeletonIntegration } from "@/components/states/skeleton-integration";
import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { env } from "@conquest/env";
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
  const {
    discord,
    loadingIntegration,
    channels,
    deleteIntegration,
    loading,
    setLoading,
  } = useIntegration();
  const { name } = discord?.details ?? {};
  const router = useRouter();

  const onEnable = () => {
    setLoading(true);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      permissions: DISCORD_PERMISSIONS,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/discord`,
      scope: DISCORD_SCOPES,
    });

    router.push(`https://discord.com/oauth2/authorize?${params.toString()}`);
  };

  const onDisconnect = async () => {
    if (!discord) return;
    await deleteIntegration({ integration: discord });
  };

  if (loadingIntegration) return <SkeletonIntegration />;

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
        loading={loading}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
      >
        <DiscordForm />
      </EnableCard>
      <ConnectedCard
        integration={discord}
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
