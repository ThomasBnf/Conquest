"use client";

import { UserProvider } from "@/context/userContext";
import { SignOut } from "@/features/onboarding/sign-out";
import type { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";

type Props = {
  user: Omit<UserWithWorkspace, "hashed_password">;
  children: React.ReactNode;
};

export const OnboardingProvider = ({ user, children }: Props) => {
  return (
    <UserProvider user={user}>
      <div className="flex h-full flex-col justify-between bg-muted/30 p-4 lg:px-8">
        <div className="flex items-center justify-between">
          <SignOut />
          <div>
            <p className="text-muted-foreground text-xs">Logged in as:</p>
            <p className="text-sm">{user?.email}</p>
          </div>
        </div>
        {children}
        <div />
      </div>
    </UserProvider>
  );
};
