"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { Discourse } from "@/components/icons/Discourse";
import { useUser } from "@/context/userContext";
import { Separator } from "@conquest/ui/separator";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DiscourseForm } from "../discourse/discourse-form";
import { ConnectedCard } from "./connected-card";
import { EnableCard } from "./enable-card";
import { IntegrationHeader } from "./integration-header";

type Props = {
  error: string;
  channels: Channel[];
};

export const DiscourseIntegration = ({ error, channels }: Props) => {
  const { discourse } = useUser();
  const [loading, setLoading] = useState(discourse?.status === "SYNCING");
  const router = useRouter();

  const onEnable = async () => {
    setLoading(true);
    router.push("/connect/discourse");
  };

  const onDisconnect = async () => {
    if (!discourse) return;

    const response = await deleteIntegration({
      integration: discourse,
      source: "DISCOURSE",
    });
    const error = response?.serverError;

    if (error) return toast.error(error);
    return toast.success("Discourse disconnected");
  };

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
        loading={loading}
        onEnable={onEnable}
        onDisconnect={onDisconnect}
      >
        <DiscourseForm loading={loading} setLoading={setLoading} />
      </EnableCard>
      <ConnectedCard
        integration={discourse}
        name="Discourse"
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
