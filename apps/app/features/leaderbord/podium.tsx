import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import type { ContactWithActivities } from "@conquest/zod/activity.schema";

type Props = {
  contact: ContactWithActivities;
  position: number;
};

export const Podium = ({ contact, position }: Props) => {
  const { full_name, activities } = contact;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="relative text-xl">
          {full_name}
          <p className="absolute -top-1.5 right-0 text-3xl">
            {position === 0 && "🥇"}
            {position === 1 && "🥈"}
            {position === 2 && "🥉"}
          </p>
        </CardTitle>
        <CardDescription>{activities.length} activities</CardDescription>
      </CardHeader>
    </Card>
  );
};
