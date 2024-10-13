import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ColumnDef } from "@tanstack/react-table";
import { TagBadge } from "features/tags/tag-badge";
import type { Activity, ContactWithActivities } from "schemas/activity.schema";
import type { Tag } from "schemas/tag.schema";
import { DateCell } from "./date-cell";
import { Header } from "./header";

type Props = {
  tags: Tag[] | undefined;
};

export const Columns = ({
  tags,
}: Props): ColumnDef<ContactWithActivities>[] => [
  {
    accessorKey: "full_name",
    header: ({ column }) => <Header column={column} title="Name" />,
    cell: ({ row }) => {
      const { avatar_url, first_name, full_name } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-10">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium">{full_name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "emails",
    header: ({ column }) => <Header column={column} title="Email" />,
    cell: ({ row }) => {
      return <p>{row.original.emails[0]}</p>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "source",
    header: ({ column }) => <Header column={column} title="Source" />,
    cell: ({ row }) => {
      return <p>{row.original.source}</p>;
    },
  },
  {
    accessorKey: "tags",
    header: ({ column }) => <Header column={column} title="Tags" />,
    cell: ({ row }) => {
      const contactTags = tags?.filter((tag) =>
        row.original.tags.includes(tag.id),
      );

      return (
        <div className="flex flex-wrap gap-1">
          {contactTags?.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "activities",
    header: ({ column }) => <Header column={column} title="Activities" />,
    cell: ({ row }) => {
      return <p>{row.original.activities.length}</p>;
    },
  },
  {
    accessorKey: "last_activity",
    header: ({ column }) => <Header column={column} title="Last activity" />,
    cell: ({ row }) => {
      const lastActivity = row.original.activities
        .filter((activity) => activity.details.type !== "JOIN")
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .at(0)?.created_at;

      if (!lastActivity) return;
      return <DateCell date={lastActivity} />;
    },
    sortingFn: (rowA, rowB) => {
      const getLastActivity = (activities: Activity[]) => {
        const filteredActivities = activities.filter(
          (activity) => activity.details.type !== "JOIN",
        );

        return filteredActivities.length > 0
          ? Math.max(...filteredActivities.map((a) => a.created_at.getTime()))
          : Number.NEGATIVE_INFINITY;
      };

      const lastActivityTimeA = getLastActivity(rowA.original.activities);
      const lastActivityTimeB = getLastActivity(rowB.original.activities);

      return lastActivityTimeB - lastActivityTimeA;
    },
  },
  {
    accessorKey: "joined_at",
    header: ({ column }) => <Header column={column} title="Joined at" />,
    cell: ({ row }) => {
      const joined_at = row.original.joined_at;
      if (!joined_at) return;

      return <DateCell date={joined_at} />;
    },
    sortingFn: (rowA, rowB) => {
      const joined_atA = rowA.original.joined_at;
      const joined_atB = rowB.original.joined_at;

      if (!joined_atA && !joined_atB) return 0;
      if (!joined_atA) return 1;
      if (!joined_atB) return -1;

      return new Date(joined_atA).getTime() - new Date(joined_atB).getTime();
    },
  },
];
