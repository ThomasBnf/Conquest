import { Button } from "@conquest/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Activity } from "schemas/activity.schema";
import { CreatedAt } from "./created-at";

type Props = {
  activity: Activity;
};

export const Menu = ({ activity }: Props) => {
  return (
    <div className="absolute right-6 top-7 flex items-center gap-2">
      <CreatedAt activity={activity} />
      <Button variant="ghost" size="icon">
        <MoreHorizontal size={16} className="text-muted-foreground" />
      </Button>
    </div>
  );
};
