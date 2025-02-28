"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import type { User } from "@conquest/zod/schemas/user.schema";
import type { Workspace } from "@conquest/zod/schemas/workspace.schema";

import * as React from "react";

type userContext = {
  user: User | undefined;
  workspace: Workspace | undefined;
  slug: string | undefined;
};

const UserContext = React.createContext<userContext>({} as userContext);

type Props = {
  children: React.ReactNode;
};

export const UserProvider = ({ children }: Props) => {
  const results = trpc.useQueries((user) => [
    user.users.getCurrentUser(),
    user.workspaces.get(),
  ]);

  const [user, workspace] = results;
  const { slug } = workspace.data ?? {};

  if (results.some((result) => result.isLoading)) return <IsLoading />;

  return (
    <UserContext.Provider
      value={{
        user: user.data,
        workspace: workspace.data,
        slug,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);
