"use client";

import { Livestorm } from "@/components/icons/Livestorm";
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
  const { livestorm, setLoading } = useIntegration();
  const { name } = livestorm?.details ?? {};
  const router = useRouter();

  const { data: events } = trpc.events.list.useQuery({ source: "Livestorm" });

  const onEnable = () => {
    setLoading(true);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
      redirect_uri: "https://app.useconquest.com/connect/livestorm",
      scope: "identity:read events:read webhooks:read webhooks:write",
    });

    router.push(
      `https://app.livestorm.co/oauth/authorize?${params.toString()}`,
    );
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
        source="Livestorm"
        onEnable={onEnable}
      >
        <LivestormForm />
      </EnableCard>
      <ConnectedCard integration={livestorm} name={name}>
        <>
          <Separator className="my-4" />
          <div>
            <p className="mb-2 font-medium text-base">Events</p>
            <div className="flex flex-col gap-2 divide-y">
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
