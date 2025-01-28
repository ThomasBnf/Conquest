"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { Livestorm } from "@/components/icons/Livestorm";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { Separator } from "@conquest/ui/separator";
import type { Event } from "@conquest/zod/schemas/event.schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EventCard } from "../livestorm/event-card";
import { LivestormForm } from "../livestorm/livestorm-form";
import { ConnectedCard } from "./connected-card";
import { EnableCard } from "./enable-card";
import { IntegrationHeader } from "./integration-header";

type Props = {
  error: string;
  events: Event[];
};

export const LivestormIntegration = ({ error, events }: Props) => {
  const { livestorm } = useUser();
  const { name } = livestorm?.details ?? {};
  const [loading, setLoading] = useState(livestorm?.status === "SYNCING");
  const router = useRouter();

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

    const response = await deleteIntegration({
      integration: livestorm,
      source: "LIVESTORM",
    });
    const error = response?.serverError;

    if (error) return toast.error(error);
    return toast.success("Livestorm disconnected");
  };

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
