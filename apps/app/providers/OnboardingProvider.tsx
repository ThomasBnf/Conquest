"use client";

import { IsLoading } from "@/components/states/is-loading";
import { UserProvider } from "@/context/userContext";
import { SignOut } from "@/features/onboarding/sign-out";
import { trpc } from "@/server/client";

type Props = {
  children: React.ReactNode;
};

export const OnboardingProvider = ({ children }: Props) => {
  const results = trpc.useQueries((user) => [
    user.users.getCurrentUser(),
    user.workspaces.getWorkspace(),
  ]);

  const [user, workspace] = results;
  const { email } = user.data ?? {};

  if (results.some((result) => result.isLoading)) return <IsLoading />;

  return (
    <UserProvider user={user.data} workspace={workspace.data}>
      <div className="flex h-full flex-col justify-between bg-muted/30 p-4 lg:px-8">
        <div className="flex items-center justify-between">
          <SignOut />
          <div>
            <p className="text-muted-foreground text-xs">Logged in as:</p>
            <p className="text-sm">{email}</p>
          </div>
        </div>
        {children}
        <div />
      </div>
    </UserProvider>
  );
};
