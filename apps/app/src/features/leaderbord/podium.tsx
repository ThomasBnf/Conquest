import type { ContactWithActivities } from "@/schemas/activity.schema";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";

type Props = {
  contact: ContactWithActivities;
  position: number;
};

export const Podium = ({ contact, position }: Props) => {
  const { full_name, activities } = contact;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="relative">
          {full_name}
          <p className="absolute -top-2 right-0 text-3xl">
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
