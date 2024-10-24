import { Icon } from "@/components/icons/Icon";
import type { icons } from "lucide-react";
import type { PropsWithChildren } from "react";

type Props = {
  icon: keyof typeof icons;
  label: string;
};

export const FieldCard = ({
  icon,
  label,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon name={icon} size={15} />
        <p>{label}</p>
      </div>
      {children}
    </div>
  );
};
