import { SettingsProvider } from "@/providers/SettingsProvider";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: PropsWithChildren<Props>) {
  const user = await getCurrentUser();

  if (!user) redirect("/");
  if (!user?.onboarding) redirect("/");

  const cookieStore = cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <SettingsProvider defaultOpen={defaultOpen}>{children}</SettingsProvider>
  );
}
