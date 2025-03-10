import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex h-full flex-col items-center justify-between gap-4 py-2">
      <div />
      {children}
      <p className="text-muted-foreground text-xs">
        © {new Date().getFullYear()} - Conquest
      </p>
    </div>
  );
}
