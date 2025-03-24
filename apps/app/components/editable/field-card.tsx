import { Icon } from "@/components/custom/Icon";
import { cn } from "@conquest/ui/cn";
import type { icons } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
type Props = {
  icon: keyof typeof icons | ReactNode;
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
    <div className={cn("grid grid-cols-[auto,1fr] gap-2", className)}>
      <div className="flex w-24 shrink-0 items-center gap-2 py-1.5 text-muted-foreground">
        {typeof icon === "string" ? (
          <Icon
            name={icon as keyof typeof icons}
            size={16}
            className="shrink-0"
          />
        ) : (
          icon
        )}
        <p className="truncate">{label}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
};
