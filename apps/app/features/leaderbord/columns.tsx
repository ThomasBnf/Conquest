import { DateCell } from "@/components/custom/date-cell";
import { LocaleBadge } from "@/components/custom/locale-badge";
import { LevelTooltip } from "@/features/members/components/level-tooltip";
import { LoveTooltip } from "@/features/members/components/love-tooltip";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
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
      <p className="h-full w-[285px] place-content-center bg-muted pl-6">
        Full Name
      </p>
    ),
    cell: ({ member }) => (
      <Link
        href={`/${slug}/members/${member.id}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "ml-4 flex items-center gap-2 truncate px-1.5",
        )}
      >
        <Avatar className="size-6">
          <AvatarImage src={member.avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {member.first_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="truncate font-medium">
          {member.first_name} {member.last_name}
        </p>
      </Link>
    ),
    width: 285,
  },
  {
    id: "company",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">
        Company
      </p>
    ),
    cell: ({ member }) => (
      <p className="truncate px-2">{member.company?.name}</p>
    ),
    width: 250,
  },
  {
    id: "job_title",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">
        Job Title
      </p>
    ),
    cell: ({ member }) => <p className="truncate px-2">{member.job_title}</p>,
    width: 250,
  },
  {
    id: "level",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Level</p>
    ),
    cell: ({ member }) => {
      return <LevelTooltip member={member} />;
    },
    width: 150,
  },
  {
    id: "love",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Love</p>
    ),
    cell: ({ member }) => {
      return <LoveTooltip member={member} />;
    },
    width: 150,
  },
  {
    id: "last_activity",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">
        Last activity
      </p>
    ),
    cell: ({ member }) => (
      <DateCell date={member.activities?.[0]?.created_at} />
    ),
    width: 250,
  },
  {
    id: "locale",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Locale</p>
    ),
    cell: ({ member }) => (
      <div className="px-2">
        <LocaleBadge country={member.locale} />
      </div>
    ),
    width: 250,
  },
  {
    id: "emails",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Email</p>
    ),
    cell: ({ member }) => <p className="truncate px-2">{member.emails?.[0]}</p>,
    width: 250,
  },
  {
    id: "tags",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Tags</p>
    ),
    cell: ({ member }) => {
      const memberTags = tags?.filter((tag) => member.tags?.includes(tag.id));

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
    id: "first_activity",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">
        First activity
      </p>
    ),
    cell: ({ member }) => <DateCell date={member.first_activity} />,
    width: 250,
  },
  {
    id: "joined_at",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">
        Joined at
      </p>
    ),
    cell: ({ member }) => <DateCell date={member.joined_at} />,
    width: 250,
  },
  {
    id: "source",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Source</p>
    ),
    cell: ({ member }) => <p className="truncate px-2">{member.source}</p>,
    width: 250,
  },
];
