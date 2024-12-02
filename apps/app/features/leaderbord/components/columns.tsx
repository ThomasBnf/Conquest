import { DateCell } from "@/components/custom/date-cell";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/tooltip";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { slug } from "cuid";
import Link from "next/link";

type Column = {
  id: string;
  header: (args: { members?: MemberWithActivities[] }) => React.ReactNode;
  cell: (args: { member: MemberWithActivities }) => React.ReactNode;
  width: number;
};

type Props = {
  tags: Tag[] | undefined;
};

export const Columns = ({ tags }: Props): Column[] => [
  {
    id: "full_name",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-6">
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
        <p className="truncate font-medium">{member.full_name}</p>
      </Link>
    ),
    width: 285,
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
    id: "emails",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Email</p>
    ),
    cell: ({ member }) => <p className="truncate px-2">{member.emails?.[0]}</p>,
    width: 250,
  },
  {
    id: "love",
    header: () => (
      <p className="h-full w-full place-content-center bg-muted pl-2">Love</p>
    ),
    cell: ({ member }) => {
      const activities_types = member.activities?.reduce(
        (acc, activity) => {
          const name = activity.activity_type.name;
          const weight = activity.activity_type.weight;
          acc[name] = {
            count: (acc[name]?.count ?? 0) + 1,
            weight,
          };
          return acc;
        },
        {} as Record<string, { count: number; weight: number }>,
      );

      const sorted_activities_types = Object.entries(activities_types ?? {})
        .sort(([, a], [, b]) => b.weight - a.weight)
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, { count: number; weight: number }>,
        );

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <p className="w-full px-2 text-end">{member.love}</p>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                {Object.entries(sorted_activities_types ?? {}).map(
                  ([name, { count, weight }]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between text-sm"
                    >
                      <p className="w-36">{name}</p>
                      <p>
                        {count} * {weight} = {count * weight}
                      </p>
                    </div>
                  ),
                )}
                <div
                  className={cn(
                    "flex items-center justify-between text-sm",
                    member.love > 0 && "mt-2",
                  )}
                >
                  <p className="w-36">Total love</p>
                  <p>{member.love}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="w-36">Total activities</p>
                  <p>{member.activities?.length}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    width: 125,
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
