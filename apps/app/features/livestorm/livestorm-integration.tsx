"use client";

import { Livestorm } from "@/components/icons/Livestorm";
import { SkeletonIntegration } from "@/components/states/skeleton-integration";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { env } from "@conquest/env";
import { Separator } from "@conquest/ui/separator";
import { useRouter } from "next/navigation";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { LivestormForm } from "../livestorm/livestorm-form";
import { EventCard } from "./event-card";

type Props = {
  error: string;
};

export const LivestormIntegration = ({ error }: Props) => {
  const {
    livestorm,
    loadingIntegration,
    deleteIntegration,
    loading,
    setLoading,
  } = useIntegration();
  const { name } = livestorm?.details ?? {};
  const router = useRouter();

  const { data: events } = trpc.events.listEvents.useQuery();

  const onEnable = () => {
    setLoading(true);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
      redirect_uri: "https://app.useconquest.com/connect/livestorm",
      scope: encodeURIComponent(
        "identity:read events:read webhooks:read webhooks:write",
      ),
    });

    router.push(
      `https://app.livestorm.co/oauth/authorize?${params.toString()}`,
    );
  };

  const onDisconnect = async () => {
    if (!livestorm) return;
    console.log("onDisconnect", livestorm);
    await deleteIntegration({ integration: livestorm });
  };

  if (loadingIntegration) return <SkeletonIntegration />;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Livestorm />
        </div>
        <p className="font-medium text-lg">Livestorm</p>
      </div>
      <EnableCard
        error={error}
        integration={livestorm}
        docUrl="https://docs.useconquest.com/integrations/livestorm"
        description="Connect your Livestorm workspace to access all your webinar sessions and participant data."
        loading={loading}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
      >
        <LivestormForm />
      </EnableCard>
      <ConnectedCard
        integration={livestorm}
        name={name}
        onDisconnect={onDisconnect}
      >
        <>
          <Separator className="my-4" />
          <div>
            <p className="mb-2 font-medium">Events</p>
            <div className="divide-y">
              {events?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </>
      </ConnectedCard>
    </div>
  );
};
