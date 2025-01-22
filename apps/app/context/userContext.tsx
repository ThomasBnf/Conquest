import type {
  DiscordIntegration,
  DiscourseIntegration,
  GithubIntegration,
  LinkedInIntegration,
  LivestormIntegration,
  SlackIntegration,
} from "@conquest/zod/schemas/integration.schema";
import type { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import type { MembersPreferences } from "@conquest/zod/schemas/workspace.schema";
import * as React from "react";

type userContext = {
  user: UserWithWorkspace | undefined;
  slug: string | undefined;
  discord: DiscordIntegration | undefined;
  discourse: DiscourseIntegration | undefined;
  github: GithubIntegration | undefined;
  linkedin: LinkedInIntegration | undefined;
  livestorm: LivestormIntegration | undefined;
  slack: SlackIntegration | undefined;
  members_preferences: MembersPreferences | undefined;
};

const UserContext = React.createContext<userContext>({} as userContext);

type Props = {
  user: UserWithWorkspace | undefined;
  children: React.ReactNode;
};

export const UserProvider = ({ user, children }: Props) => {
  const slug = user?.workspace.slug;

  const discord = user?.workspace.integrations.find(
    (integration) => integration.details.source === "DISCORD",
  ) as DiscordIntegration | undefined;

  const discourse = user?.workspace.integrations.find(
    (integration) => integration.details.source === "DISCOURSE",
  ) as DiscourseIntegration | undefined;

  const linkedin = user?.workspace.integrations.find(
    (integration) => integration.details.source === "LINKEDIN",
  ) as LinkedInIntegration | undefined;

  const livestorm = user?.workspace.integrations.find(
    (integration) => integration.details.source === "LIVESTORM",
  ) as LivestormIntegration | undefined;

  const github = user?.workspace.integrations.find(
    (integration) => integration.details.source === "GITHUB",
  ) as GithubIntegration | undefined;

  const slack = user?.workspace.integrations.find(
    (integration) => integration.details.source === "SLACK",
  ) as SlackIntegration | undefined;

  const members_preferences = user?.workspace.members_preferences;

  return (
    <UserContext.Provider
      value={{
        user,
        slug,
        discord,
        discourse,
        github,
        linkedin,
        livestorm,
        slack,
        members_preferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);
