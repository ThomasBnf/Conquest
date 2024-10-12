import { getCurrentUser } from "@/actions/users/getCurrentUser";
import { Sidebar } from "@/components/layouts/sidebar";
import { UserProvider } from "@/context/userContext";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Layout({
  children,
  params: { slug },
}: PropsWithChildren<Props>) {
  if (slug.includes("favicon")) return;

  const rUser = await getCurrentUser();
  const user = rUser?.data;

  if (!user?.onboarding) redirect("/");
  if (user?.workspace.slug !== slug) redirect(`/${user?.workspace.slug}`);

  return (
    <UserProvider user={user}>
      <div className="flex h-dvh divide-x">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </UserProvider>
  );
}
