import { UserProvider } from "@/context/userContext";
import { SignOut } from "@/features/onboarding/sign-out";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { getWorkspace } from "@conquest/clickhouse/workspaces/getWorkspace";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();
  const workspace = await getWorkspace({ id: user.workspace_id });

  const { email } = user;
  const { slug } = workspace ?? {};

  if (!user) redirect("/auth/login");
  if (user?.onboarding) redirect(`/${slug}`);

  return (
    <UserProvider>
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
}
