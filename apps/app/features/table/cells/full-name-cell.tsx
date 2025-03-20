import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { GithubProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { skipToken } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Props = {
  row: Row<Member>;
};

export const FullNameCell = ({ row }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};
  const { id, first_name, last_name, avatar_url } = row.original;

  const hasName = !!first_name && !!last_name;

  const { data, isLoading } = trpc.profiles.getBySource.useQuery(
    !hasName ? { member_id: id, source: "Github" } : skipToken,
  );

  const profile = data ? GithubProfileSchema.parse(data) : null;
  const { login } = profile?.attributes ?? {};

  return (
    <Link
      href={`/${slug}/members/${id}/analytics`}
      className={cn(buttonVariants({ variant: "ghost" }), "truncate pl-1")}
      prefetch
    >
      <Avatar className="size-6">
        <AvatarImage src={avatar_url ?? ""} />
        <AvatarFallback className="text-sm ">
          {first_name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : hasName ? (
          <p className="truncate font-medium">{`${first_name} ${last_name}`}</p>
        ) : (
          <p className="truncate font-medium">{login}</p>
        )}
      </div>
    </Link>
  );
};
