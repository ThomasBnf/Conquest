"use client";

import { Livestorm } from "@/components/icons/Livestorm";
import { SkeletonIntegration } from "@/components/states/skeleton-integration";
import { trpc } from "@/server/client";
import { env } from "@conquest/env";
import { Separator } from "@conquest/ui/separator";
import type { Event } from "@conquest/zod/schemas/event.schema";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { EventCard } from "../livestorm/event-card";
import { LivestormForm } from "../livestorm/livestorm-form";

type Props = {
  error: string;
  events: Event[];
};

export const LivestormIntegration = ({ error, events }: Props) => {
  const { data, isLoading } = trpc.integrations.getIntegrationBySource.useQuery(
    { source: "LIVESTORM" },
  );
  const livestorm = data ? LivestormIntegrationSchema.parse(data) : null;
  const { status, details } = livestorm ?? {};
  const { name } = details ?? {};

  const [loading, setLoading] = useState(status === "SYNCING");

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.integrations.deleteIntegration.useMutation({
    onSuccess: () => {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "LIVESTORM",
      });
      toast.success("Livestorm disconnected");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
    await mutateAsync({ integration: livestorm });
  };

  if (isLoading) return <SkeletonIntegration />;

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
        <LivestormForm loading={loading} setLoading={setLoading} />
      </EnableCard>
      <ConnectedCard
        integration={livestorm}
        name={name}
        onDisconnect={onDisconnect}
      >
        <>
          <Separator className="my-4" />
          <div>
            <p className="mb-2 font-medium">Channels</p>
            <div className="space-y-1">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </>
      </ConnectedCard>
    </div>
  );
};
