import { Button } from "@conquest/ui/button";
import type { Activity } from "@conquest/zod/activity.schema";
import { MoreHorizontal } from "lucide-react";

type Props = {
  activity: Activity;
};

export const Menu = ({ activity }: Props) => {
  return (
    <Button variant="ghost" size="icon" className="absolute top-4 right-4">
      <MoreHorizontal size={16} className="text-muted-foreground" />
    </Button>
  );
};
