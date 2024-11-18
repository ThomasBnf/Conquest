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
    <div className={cn("flex space-x-1.5 items-center min-h-8", className)}>
      <div className="flex items-center gap-2 text-muted-foreground w-28 shrink-0">
        <Icon name={icon} size={15} className="shrink-0" />
        <p>{label}</p>
      </div>
      {children}
    </div>
  );
};
