import { DateCell } from "@/components/custom/date-cell";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { slug } from "cuid";
import Link from "next/link";

type Column = {
  id: string;
  header: (args: {
    members?: MemberWithActivities[];
  }) => React.ReactNode;
  cell: (args: {
    member: MemberWithActivities;
  }) => React.ReactNode;
  width: number;
};

type Props = {
  tags: Tag[] | undefined;
};

export const Columns = ({ tags }: Props): Column[] => [
  {
    id: "full_name",
    header: () => (
      <p className="pl-6 bg-muted h-full place-content-center w-full">
        Full Name
      </p>
    ),
    cell: ({ member }) => (
      <Link
        href={`/${slug}/members/${member.id}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center gap-2 px-1.5 truncate ml-4",
        )}
      >
        <Avatar className="size-6">
          <AvatarImage src={member.avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {member.first_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="font-medium truncate">{member.full_name}</p>
      </Link>
    ),
    width: 285,
  },
  {
    id: "emails",
    header: () => (
      <p className="pl-2 bg-muted h-full place-content-center w-full">Email</p>
    ),
    cell: ({ member }) => <p className="truncate px-2">{member.emails?.[0]}</p>,
    width: 250,
  },
  {
    id: "source",
    header: () => (
      <p className="pl-2 bg-muted h-full place-content-center w-full">Source</p>
    ),
    cell: ({ member }) => <p className="truncate px-2">{member.source}</p>,
    width: 250,
  },
  {
    id: "tags",
    header: () => (
      <p className="pl-2 bg-muted h-full place-content-center w-full">Tags</p>
    ),
    cell: ({ member }) => {
      const memberTags = tags?.filter((tag) => member.tags.includes(tag.id));

      return (
        <div className="flex flex-wrap gap-1 px-2">
          {memberTags?.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      );
    },
    width: 250,
  },
  {
    id: "activities",
    header: () => (
      <p className="pl-2 bg-muted h-full place-content-center w-full">
        Activities
      </p>
    ),
    cell: ({ member }) => <p className="px-2">{member.activities.length}</p>,
    width: 250,
  },
  {
    id: "last_activity",
    header: () => (
      <p className="pl-2 bg-muted h-full place-content-center w-full">
        Last activity
      </p>
    ),
    cell: ({ member }) => <DateCell date={member.activities[0]?.created_at} />,
    width: 250,
  },
  {
    id: "joined_at",
    header: () => (
      <p className="pl-2 bg-muted h-full place-content-center w-full">
        Joined at
      </p>
    ),
    cell: ({ member }) => <DateCell date={member.joined_at} />,
    width: 250,
  },
];
