import { UserProvider } from "@/context/userContext";
import { SignOut } from "@/features/onboarding/sign-out";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();

  if (user?.onboarding) redirect(`/${user.workspace.slug}`);

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
}
