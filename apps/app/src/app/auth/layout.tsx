import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-between py-10">
      <div />
      {children}
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} - Conquest
      </p>
    </div>
  );
}
