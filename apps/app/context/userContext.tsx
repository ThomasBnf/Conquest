"use client";

import { createContext, useContext } from "react";
import type { UserWithWorkspace } from "schemas/user.schema";

type userContext = {
  user: UserWithWorkspace | undefined;
  slug: string | undefined;
};

const userContext = createContext<userContext>({} as userContext);

type Props = {
  user: UserWithWorkspace | undefined;
  children: React.ReactNode;
};

export const UserProvider = ({ user, children }: Props) => {
  const slug = user?.workspace.slug;

  return (
    <userContext.Provider
      value={{
        user,
        slug,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
