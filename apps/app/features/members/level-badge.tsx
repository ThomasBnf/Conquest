import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Level } from "@conquest/ui/icons/Level";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: Member | undefined;
  isBadge?: boolean;
};

export const LevelBadge = ({ member, isBadge = true }: Props) => {
  const { data, isLoading } = trpc.levels.list.useQuery();
  const level = data?.find((level) => level.number === member?.levelNumber);

  if (isLoading) return <Skeleton className="w-28 h-6" />;

  const LevelInfo = (
    <div className="flex items-center">
      {level && <Level size={18} className="mr-1.5" />}
      {level ? (
        <p>
          {level.number} • {level?.name}
        </p>
      ) : (
        <p className="text-muted-foreground">No level</p>
      )}
    </div>
  );

  if (isBadge) return <Badge variant="outline">{LevelInfo}</Badge>;
  return LevelInfo;
};
