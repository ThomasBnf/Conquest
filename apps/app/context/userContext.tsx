"use client";

import type {
  DiscordIntegration,
  DiscourseIntegration,
  LinkedInIntegration,
  LivestormIntegration,
  SlackIntegration,
} from "@conquest/zod/schemas/integration.schema";
import type { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import type { MembersPreferences } from "@conquest/zod/schemas/workspace.schema";
import { createContext, useContext } from "react";

type userContext = {
  user: UserWithWorkspace | undefined;
  slug: string | undefined;
  slack: SlackIntegration | undefined;
  discourse: DiscourseIntegration | undefined;
  discord: DiscordIntegration | undefined;
  livestorm: LivestormIntegration | undefined;
  linkedin: LinkedInIntegration | undefined;
  members_preferences: MembersPreferences | undefined;
};

const UserContext = createContext<userContext>({} as userContext);

type Props = {
  user: UserWithWorkspace | undefined;
  children: React.ReactNode;
};

export const UserProvider = ({ user, children }: Props) => {
  const slug = user?.workspace.slug;

  const slack = user?.workspace.integrations.find(
    (integration) => integration.details.source === "SLACK",
  ) as SlackIntegration | undefined;

  const discourse = user?.workspace.integrations.find(
    (integration) => integration.details.source === "DISCOURSE",
  ) as DiscourseIntegration | undefined;

  const discord = user?.workspace.integrations.find(
    (integration) => integration.details.source === "DISCORD",
  ) as DiscordIntegration | undefined;

  const livestorm = user?.workspace.integrations.find(
    (integration) => integration.details.source === "LIVESTORM",
  ) as LivestormIntegration | undefined;

  const linkedin = user?.workspace.integrations.find(
    (integration) => integration.details.source === "LINKEDIN",
  ) as LinkedInIntegration | undefined;

  const members_preferences = user?.workspace.members_preferences;

  return (
    <UserContext.Provider
      value={{
        user,
        slug,
        slack,
        discourse,
        discord,
        livestorm,
        linkedin,
        members_preferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
