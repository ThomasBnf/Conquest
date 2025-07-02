import { getCurrentWorkspace } from "@/queries/getCurrentWorkspace";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: PropsWithChildren<Props>) {
  const { workspace } = await getCurrentWorkspace();
  const { trialEnd, isPastDue, slug } = workspace;

  // if (!trialEnd && !isPastDue) redirect(`/${slug}`);

  return <main className="h-dvh flex-1 overflow-hidden">{children}</main>;
}
