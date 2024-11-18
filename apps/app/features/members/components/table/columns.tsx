import { DateCell } from "@/components/custom/date-cell";
import { useUser } from "@/context/userContext";
import { ColumnHeader } from "@/features/table/column-header";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
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
      <div className="flex items-center justify-center size-12 bg-muted">
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
      <div className="flex items-center justify-center size-12">
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
            "flex items-center gap-2 px-1.5 truncate",
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
    id: "posts",
    header: () => <ColumnHeader id="posts" title="Posts" width={125} />,
    cell: ({ member }) => {
      const posts = member.activities.filter(
        (activity) => activity.details.type === "POST",
      );
      return <p className="px-2 text-end w-full">{posts.length}</p>;
    },
    width: 125,
  },
  {
    id: "replies",
    header: () => <ColumnHeader id="replies" title="Replies" width={125} />,
    cell: ({ member }) => {
      const replies = member.activities.filter(
        (activity) => activity.details.type === "REPLY",
      );
      return <p className="px-2 text-end w-full">{replies.length}</p>;
    },
    width: 125,
  },
  {
    id: "reactions",
    header: () => <ColumnHeader id="reactions" title="Reactions" width={125} />,
    cell: ({ member }) => {
      const reactions = member.activities.filter(
        (activity) => activity.details.type === "REACTION",
      );
      return <p className="px-2 text-end w-full">{reactions.length}</p>;
    },
    width: 125,
  },
  {
    id: "invitations",
    header: () => (
      <ColumnHeader id="invitations" title="Invitations" width={125} />
    ),
    cell: ({ member }) => {
      const invitations = member.activities.filter(
        (activity) => activity.details.type === "INVITATION",
      );
      return <p className="px-2 text-end w-full">{invitations.length}</p>;
    },
    width: 125,
  },
  {
    id: "points",
    header: () => <ColumnHeader id="points" title="Points" width={125} />,
    cell: ({ member }) => {
      const { slack, discourse } = useUser();

      const points = member.activities.reduce((total, activity) => {
        const source = activity.details.source;
        const integration =
          source === "SLACK"
            ? slack?.details.points_config
            : source === "DISCOURSE"
              ? discourse?.details.points_config
              : undefined;

        switch (activity.details.type) {
          case "POST":
            return total + (integration?.post ?? 0);
          case "REACTION":
            return total + (integration?.reaction ?? 0);
          case "REPLY":
            return total + (integration?.reply ?? 0);
          case "INVITATION":
            return total + (integration?.invitation ?? 0);
          default:
            return total;
        }
      }, 0);

      return <p className="px-2 text-end w-full">{points}</p>;
    },
    width: 125,
  },
  {
    id: "tags",
    header: () => <ColumnHeader id="tags" title="Tags" width={250} />,
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
    id: "last_activity",
    header: () => (
      <ColumnHeader id="last_activity" title="Last activity" width={250} />
    ),
    cell: ({ member }) => <DateCell date={member.activities[0]?.created_at} />,
    width: 250,
  },
  {
    id: "joined_at",
    header: () => <ColumnHeader id="joined_at" title="Joined at" width={250} />,
    cell: ({ member }) => <DateCell date={member.joined_at} />,
    width: 250,
  },
  {
    id: "source",
    header: () => <ColumnHeader id="source" title="Source" width={250} />,
    cell: ({ member }) => <p className="truncate px-2">{member.source}</p>,
    width: 250,
  },
];
