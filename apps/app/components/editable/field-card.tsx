import { cn } from "@conquest/ui/cn";
import type { PropsWithChildren } from "react";

type Props = {
  label: string;
  className?: string;
};

export const FieldCard = ({
  label,
  children,
  className,
}: PropsWithChildren<Props>) => {
  return (
    <div className={cn("-ml-[9px] flex flex-col gap-1", className)}>
      <p className="ml-[9px] text-muted-foreground text-xs">{label}</p>
      <div>{children}</div>
    </div>
  );
};
