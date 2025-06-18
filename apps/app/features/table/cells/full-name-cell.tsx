import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { GithubProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { skipToken } from "@tanstack/react-query";
import Link from "next/link";

type Props = {
  member: Member;
};

export const FullNameCell = ({ member }: Props) => {
  const { id, firstName, lastName, avatarUrl } = member;
  const { slug } = useWorkspace();

  const hasName = !!firstName || !!lastName;

  const { data, isLoading } = trpc.profiles.getBySource.useQuery(
    !hasName ? { memberId: id, source: "Github" } : skipToken,
  );

  const profile = data ? GithubProfileSchema.parse(data) : null;
  const { externalId } = profile ?? {};

  return (
    <Link
      href={`/${slug}/members/${id}/analytics`}
      className="group flex items-center gap-2 truncate font-medium"
      prefetch
    >
      <Avatar className="size-6">
        <AvatarImage src={avatarUrl ?? ""} />
        <AvatarFallback>{firstName?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      {isLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : hasName ? (
        <p className="truncate group-hover:underline">{`${firstName} ${lastName}`}</p>
      ) : (
        <p className="truncate group-hover:underline">{externalId}</p>
      )}
    </Link>
  );
};
