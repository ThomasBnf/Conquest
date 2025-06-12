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
    <div className={cn("flex flex-col gap-0.5", className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      {children}
    </div>
  );
};
