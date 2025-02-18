import { OnboardingProvider } from "@/providers/OnboardingProvider";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { getWorkspace } from "@conquest/db/queries/workspace/getWorkspace";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();
  const workspace = await getWorkspace({ id: user?.workspace_id });

  if (!user) redirect("/");
  if (user?.onboarding) redirect(`/${workspace.slug}`);

  return <OnboardingProvider>{children}</OnboardingProvider>;
}
