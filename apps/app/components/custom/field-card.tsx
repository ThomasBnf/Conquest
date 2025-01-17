import { Icon } from "@/components/icons/Icon";
import { cn } from "@conquest/ui/cn";
import type { icons } from "lucide-react";
import type { PropsWithChildren } from "react";

type Props = {
  icon: keyof typeof icons;
  label: string;
  className?: string;
};

export const FieldCard = ({
  icon,
  label,
  children,
  className,
}: PropsWithChildren<Props>) => {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex w-28 shrink-0 items-center gap-2 py-1.5 text-muted-foreground">
        <Icon name={icon} size={15} className="shrink-0" />
        <p className="truncate">{label}</p>
      </div>
      {children}
    </div>
  );
};
