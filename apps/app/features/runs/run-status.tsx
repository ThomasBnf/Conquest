import { Badge, BadgeProps } from "@conquest/ui/badge";
import { RunStatus as RunStatusType } from "@conquest/zod/schemas/run.schema";
import { Check, Loader2, X } from "lucide-react";

type Props = {
  status: RunStatusType;
};

export const RunStatus = ({ status }: Props) => {
  const statusConfig: {
    [key in RunStatusType]: {
      variant: BadgeProps["variant"];
      icon: React.ReactNode;
    };
  } = {
    FAILED: {
      variant: "destructive",
      icon: <X size={14} />,
    },
    RUNNING: {
      variant: "secondary",
      icon: <Loader2 size={14} className="animate-spin text-main-500" />,
    },
    COMPLETED: {
      variant: "success",
      icon: <Check size={14} />,
    },
  };

  const { variant, icon } = statusConfig[status];

  return (
    <Badge variant={variant} className="mr-2 size-5 p-0">
      {icon}
    </Badge>
  );
};
