"use client";

import { LoadingChannels } from "@/components/states/loading-channels";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Separator } from "@conquest/ui/separator";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConnectedCard } from "../integrations/connected-card";
import { EnableCard } from "../integrations/enable-card";
import { IntegrationHeader } from "../integrations/integration-header";
import { DiscourseForm } from "./discourse-form";

type Props = {
  error: string;
};

export const DiscourseIntegration = ({ error }: Props) => {
  const { discourse, setLoading, channels } = useIntegration();
  const router = useRouter();
  const utils = trpc.useUtils();

  const onEnable = async () => {
    setLoading(true);
    router.push("/connect/discourse");
  };

  useEffect(() => {
    utils.integrations.bySource.invalidate({ source: "Discourse" });
    router.refresh();
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12 lg:py-24">
      <IntegrationHeader />
      <div className="flex items-center gap-4">
        <div className="rounded-md border p-3">
          <Discourse />
        </div>
        <p className="font-medium text-lg">Discourse</p>
      </div>
      <EnableCard
        error={error}
        integration={discourse}
        docUrl="https://docs.useconquest.com/integrations/discourse"
        description="Connect your Discourse community to get a complete overview of your members and community activity."
        source="Discourse"
        onEnable={onEnable}
      >
        <DiscourseForm />
      </EnableCard>
      <ConnectedCard integration={discourse} name="Discourse">
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
