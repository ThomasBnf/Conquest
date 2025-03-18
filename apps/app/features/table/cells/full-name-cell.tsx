import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import type { Member } from "@conquest/zod/schemas/member.schema";
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
      <p className="truncate font-medium">
        {first_name} {last_name}
      </p>
    </Link>
  );
};
