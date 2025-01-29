import { IsLoading } from "@/components/states/is-loading";
import { SlugProvider } from "@/providers/SlugProvider";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listLists } from "@conquest/db/queries/lists/listLists";
import { updateUser } from "@conquest/db/queries/users/updateUser";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Suspense } from "react";

type Props = {
  children: React.ReactNode;
  params: Record<string, string>;
};

export default async function Layout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const user = await getCurrentUser();
  await updateUser({ id: user.id });
  const { workspace_id } = user;

  if (!user?.onboarding) redirect("/");
  if (user?.workspace.slug !== params.slug) redirect(`/${user.workspace.slug}`);

  const cookieStore = cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  const lists = await listLists({ workspace_id });

  return (
    <Suspense fallback={<IsLoading />}>
      <SlugProvider user={user} defaultOpen={defaultOpen} lists={lists}>
        {children}
      </SlugProvider>
    </Suspense>
  );
}
