import { OnboardingProvider } from "@/providers/OnboardingProvider";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();

  if (user?.onboarding) redirect(`/${user.workspace.slug}`);

  return <OnboardingProvider user={user}>{children}</OnboardingProvider>;
}
