import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col items-center justify-between py-10">
      <div />
      {children}
      <p className="text-muted-foreground text-xs">
        © {new Date().getFullYear()} - Conquest
      </p>
    </div>
  );
}
