import type { Preferences, User } from "@conquest/zod/schemas/user.schema";
import type { Workspace } from "@conquest/zod/schemas/workspace.schema";

import * as React from "react";

type userContext = {
  user: Omit<User, "hashed_password"> | undefined;
  slug: string | undefined;
  workspace: Workspace | null | undefined;
  members_preferences: Preferences | undefined;
};

const UserContext = React.createContext<userContext>({} as userContext);

type Props = {
  user: Omit<User, "hashed_password"> | undefined;
  workspace: Workspace | null | undefined;
  children: React.ReactNode;
};

export const UserProvider = ({ user, workspace, children }: Props) => {
  const { members_preferences } = user ?? {};
  const { slug } = workspace ?? {};

  return (
    <UserContext.Provider
      value={{
        user,
        slug,
        workspace,
        members_preferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);
