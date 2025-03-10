"use client";

import { SkeletonIntegration } from "@/components/states/skeleton-integration";
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
  deleteIntegration: (integration: {
    integration: Integration;
  }) => Promise<{ success: boolean }>;
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
  loader?: boolean;
  children: React.ReactNode;
};

export const IntegrationProvider = ({
  source,
  loader = true,
  children,
}: Props) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  let discord: DiscordIntegration | null = null;
  let discourse: DiscourseIntegration | null = null;
  let github: GithubIntegration | null = null;
  let linkedin: LinkedInIntegration | null = null;
  let livestorm: LivestormIntegration | null = null;
  let slack: SlackIntegration | null = null;

  const { data, isLoading } = trpc.integrations.bySource.useQuery({ source });

  if (data) {
    switch (source) {
      case "Discord":
        discord = DiscordIntegrationSchema.parse(data);
        break;
      case "Discourse":
        discourse = DiscourseIntegrationSchema.parse(data);
        break;
      case "Github":
        github = GithubIntegrationSchema.parse(data);
        break;
      case "Linkedin":
        linkedin = LinkedInIntegrationSchema.parse(data);
        break;
      case "Livestorm":
        livestorm = LivestormIntegrationSchema.parse(data);
        break;
      case "Slack":
        slack = SlackIntegrationSchema.parse(data);
        break;
    }
  }

  const { data: channels } = trpc.channels.list.useQuery({ source });

  const { mutateAsync: deleteIntegration } =
    trpc.integrations.delete.useMutation({
      onSuccess: () => {
        toast.success(`${source} disconnected`);
        utils.channels.list.invalidate({ source });
        utils.integrations.bySource.invalidate({ source });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  if (isLoading && loader) return <SkeletonIntegration />;

  return (
    <IntegrationContext.Provider
      value={{
        discord,
        discourse,
        github,
        linkedin,
        livestorm,
        slack,
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
