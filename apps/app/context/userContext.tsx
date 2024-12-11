"use client";

import type {
  DiscourseIntegration,
  SlackIntegration,
} from "@conquest/zod/integration.schema";
import type { MembersPreferences } from "@conquest/zod/schemas/workspace.schema";
import type { UserWithWorkspace } from "@conquest/zod/user.schema";
import { createContext, useContext } from "react";

type userContext = {
  user: UserWithWorkspace | undefined;
  slug: string | undefined;
  triggerToken: string | null | undefined;
  slack: SlackIntegration | undefined;
  discourse: DiscourseIntegration | undefined;
  members_preferences: MembersPreferences | undefined;
};

const userContext = createContext<userContext>({} as userContext);

type Props = {
  user: UserWithWorkspace | undefined;
  children: React.ReactNode;
};

export const UserProvider = ({ user, children }: Props) => {
  const slug = user?.workspace.slug;
  const triggerToken = user?.workspace.trigger_token;

  const slack = user?.workspace.integrations.find(
    (integration) => integration.details.source === "SLACK",
  ) as SlackIntegration | undefined;

  const discourse = user?.workspace.integrations.find(
    (integration) => integration.details.source === "DISCOURSE",
  ) as DiscourseIntegration | undefined;

  const members_preferences = user?.workspace.members_preferences;

  return (
    <userContext.Provider
      value={{
        user,
        slug,
        triggerToken,
        slack,
        discourse,
        members_preferences,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
