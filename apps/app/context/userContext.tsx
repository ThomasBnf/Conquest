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
  initialUser: User;
  initialWorkspace: Workspace;
  children: React.ReactNode;
};

export const UserProvider = ({
  initialUser,
  initialWorkspace,
  children,
}: Props) => {
  const { data: user, isLoading } = trpc.users.getCurrentUser.useQuery(
    undefined,
    { initialData: initialUser },
  );

  const { data: workspace } = trpc.workspaces.get.useQuery(undefined, {
    initialData: initialWorkspace,
  });

  const { slug } = workspace ?? {};
  if (isLoading) return <IsLoading />;

  return (
    <UserContext.Provider
      value={{
        user,
        workspace,
        slug,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);
