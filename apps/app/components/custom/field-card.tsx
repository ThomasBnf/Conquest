import { Icon } from "@/components/icons/Icon";
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
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex w-28 shrink-0 items-center gap-2 py-1.5 text-muted-foreground">
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
      {children}
    </div>
  );
};
