"use client";

import { trpc } from "@/server/client";
import type { Source } from "@conquest/zod/enum/source.enum";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import {
  type DiscordIntegration,
  DiscordIntegrationSchema,
  type DiscourseIntegration,
  DiscourseIntegrationSchema,
  type GithubIntegration,
  GithubIntegrationSchema,
  type Integration,
  type LinkedInIntegration,
  LinkedInIntegrationSchema,
  type LivestormIntegration,
  LivestormIntegrationSchema,
  type SlackIntegration,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

type integrationContext = {
  discord: DiscordIntegration | null;
  discourse: DiscourseIntegration | null;
  github: GithubIntegration | null;
  linkedin: LinkedInIntegration | null;
  livestorm: LivestormIntegration | null;
  slack: SlackIntegration | null;
  channels: Channel[] | undefined;
  loadingIntegration: boolean;
  deleteIntegration: (integration: {
    integration: Integration;
  }) => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  step: number;
  setStep: (step: number) => void;
};

const IntegrationContext = createContext<integrationContext>(
  {} as integrationContext,
);

type Props = {
  source: Source;
  children: React.ReactNode;
};

export const IntegrationProvider = ({ source, children }: Props) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  let discord: DiscordIntegration | null = null;
  let discourse: DiscourseIntegration | null = null;
  let github: GithubIntegration | null = null;
  let linkedin: LinkedInIntegration | null = null;
  let livestorm: LivestormIntegration | null = null;
  let slack: SlackIntegration | null = null;

  const { data, isLoading: loadingIntegration } =
    trpc.integrations.getIntegrationBySource.useQuery({
      source,
    });

  if (data) {
    switch (source) {
      case "DISCORD":
        discord = DiscordIntegrationSchema.parse(data);
        break;
      case "DISCOURSE":
        discourse = DiscourseIntegrationSchema.parse(data);
        break;
      case "GITHUB":
        github = GithubIntegrationSchema.parse(data);
        break;
      case "LINKEDIN":
        linkedin = LinkedInIntegrationSchema.parse(data);
        break;
      case "LIVESTORM":
        livestorm = LivestormIntegrationSchema.parse(data);
        break;
      case "SLACK":
        slack = SlackIntegrationSchema.parse(data);
        break;
    }
  }

  const { data: channels } = trpc.channels.getAllChannels.useQuery({ source });

  const { mutateAsync: deleteIntegration } =
    trpc.integrations.deleteIntegration.useMutation({
      onSuccess: () => {
        utils.integrations.getIntegrationBySource.invalidate();
        utils.channels.getAllChannels.invalidate({ source });
        toast.success(
          `${source.charAt(0).toUpperCase() + source.slice(1).toLowerCase()} disconnected`,
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <IntegrationContext.Provider
      value={{
        discord,
        discourse,
        github,
        linkedin,
        livestorm,
        slack,
        loadingIntegration,
        channels,
        deleteIntegration,
        loading,
        setLoading,
        step,
        setStep,
      }}
    >
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegration = () => useContext(IntegrationContext);
