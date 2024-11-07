"use client";

import type { Integration } from "@conquest/zod/integration.schema";
import type { UserWithWorkspace } from "@conquest/zod/user.schema";
import { createContext, useContext } from "react";

type userContext = {
  user: UserWithWorkspace | undefined;
  slug: string | null | undefined;
  slack: Integration | undefined;
  discourse: Integration | undefined;
};

const userContext = createContext<userContext>({} as userContext);

type Props = {
  user: UserWithWorkspace | undefined;
  children: React.ReactNode;
};

export const UserProvider = ({ user, children }: Props) => {
  const slug = user?.workspace.slug;
  const slack = user?.workspace.integrations.find(
    (integration) => integration.source === "SLACK",
  );
  const discourse = user?.workspace.integrations.find(
    (integration) => integration.source === "DISCOURSE",
  );

  return (
    <userContext.Provider
      value={{
        user,
        slug,
        slack,
        discourse,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
