import { DateCell } from "@/components/custom/date-cell";
import { SourceBadge } from "@/components/custom/source-badge";
import { useUser } from "@/context/userContext";
import { ColumnHeader } from "@/features/table/column-header";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/tooltip";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

type Column = {
  id: string;
  header: (args: {
    members?: MemberWithActivities[];
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  cell: (args: {
    member: MemberWithActivities;
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  width: number;
};

type Props = {
  tags: Tag[] | undefined;
};

export const Columns = ({ tags }: Props): Column[] => [
  {
    id: "select",
    header: ({ members, rowSelected, setRowSelected }) => (
      <div className="flex size-12 items-center justify-center bg-muted">
        <Checkbox
          checked={
            !rowSelected?.length
              ? false
              : rowSelected.length === members?.length
                ? true
                : "indeterminate"
          }
          onClick={(e) => {
            e.stopPropagation();
            if (rowSelected?.length === members?.length) {
              setRowSelected?.([]);
            } else {
              setRowSelected?.(members?.map((member) => member.id) ?? []);
            }
          }}
        />
      </div>
    ),
    cell: ({ member, rowSelected, setRowSelected }) => (
      <div className="flex size-12 items-center justify-center">
        <Checkbox
          checked={rowSelected?.includes(member.id)}
          onCheckedChange={(checked) =>
            setRowSelected?.(
              checked
                ? [...(rowSelected ?? []), member.id]
                : (rowSelected ?? []).filter((id) => id !== member.id),
            )
          }
        />
      </div>
    ),
    width: 40,
  },
  {
    id: "full_name",
    header: () => <ColumnHeader id="full_name" title="Full Name" width={285} />,
    cell: ({ member }) => {
      const { slug } = useUser();
      return (
        <Link
          href={`/${slug}/members/${member.id}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex items-center gap-2 truncate px-1.5",
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
      );
    },
    width: 285,
  },
  {
    id: "job_title",
    header: () => <ColumnHeader id="job_title" title="Job Title" width={250} />,
    cell: ({ member }) => <p className="truncate px-2">{member.job_title}</p>,
    width: 250,
  },
  {
    id: "emails",
    header: () => <ColumnHeader id="emails" title="Email" width={250} />,
    cell: ({ member }) => <p className="truncate px-2">{member.emails?.[0]}</p>,
    width: 250,
  },
  {
    id: "level",
    header: () => <ColumnHeader id="level" title="Level" width={125} />,
    cell: ({ member }) => {
      return <p className="w-full px-2 text-end">{member.level}</p>;
    },
    width: 125,
  },
  {
    id: "love",
    header: () => <ColumnHeader id="love" title="Love" width={125} />,
    cell: ({ member }) => {
      const activities_types = member.activities?.reduce(
        (acc, activity) => {
          const key = activity.activity_type.key;
          const weight = activity.activity_type.weight;
          acc[key] = {
            count: (acc[key]?.count ?? 0) + 1,
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
                  ([key, { count, weight }]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <p className="w-36">{key}</p>
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
    header: () => <ColumnHeader id="tags" title="Tags" width={250} />,
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
    id: "phones",
    header: () => <ColumnHeader id="phones" title="Phones" width={250} />,
    cell: ({ member }) => <p className="truncate px-2">{member.phones?.[0]}</p>,
    width: 250,
  },
  {
    id: "last_activity",
    header: () => (
      <ColumnHeader id="last_activity" title="Last activity" width={250} />
    ),
    cell: ({ member }) => (
      <DateCell date={member.activities?.[0]?.created_at} />
    ),
    width: 250,
  },
  {
    id: "joined_at",
    header: () => <ColumnHeader id="joined_at" title="Joined at" width={250} />,
    cell: ({ member }) => <DateCell date={member.joined_at} />,
    width: 250,
  },
  {
    id: "localisation",
    header: () => (
      <ColumnHeader id="localisation" title="Localisation" width={250} />
    ),
    cell: ({ member }) => (
      <p className="truncate px-2">{member.localisation}</p>
    ),
    width: 250,
  },
  {
    id: "source",
    header: () => <ColumnHeader id="source" title="Source" width={250} />,
    cell: ({ member }) => (
      <SourceBadge source={member.source} className="mx-2" />
    ),
    width: 250,
  },
];
