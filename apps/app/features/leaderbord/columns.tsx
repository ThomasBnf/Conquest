import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { ContactWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { DateCell } from "../contacts/table/date-cell";
import { TagBadge } from "../tags/tag-badge";

export const Columns = (
  tags: Tag[] | undefined,
): ColumnDef<ContactWithActivities>[] => [
  {
    accessorKey: "place",
    header: () => <p className="text-center">Place</p>,
    cell: ({ row, table }) => {
      const rowIndex = table
        .getRowModel()
        .rows.findIndex((r) => r.id === row.id);
      return <p className="text-center">{rowIndex + 4}</p>;
    },
  },
  {
    accessorKey: "full_name",
    header: () => <p className="px-2">Name</p>,
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
    header: () => <p className="px-2">Email</p>,
    cell: ({ row }) => {
      return <p>{row.original.emails[0]}</p>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "source",
    header: () => <p className="px-2">Source</p>,
    cell: ({ row }) => {
      return <p>{row.original.source}</p>;
    },
  },
  {
    accessorKey: "tags",
    header: () => <p className="px-2">Tags</p>,
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
    header: () => <p className="px-2">Activities</p>,
    cell: ({ row }) => {
      return <p>{row.original.activities.length}</p>;
    },
  },
  {
    accessorKey: "last_activity",
    header: () => <p className="px-2">Last activity</p>,
    cell: ({ row }) => {
      const lastActivity = row.original.activities
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .at(0)?.created_at;

      if (!lastActivity) return;
      return <DateCell date={lastActivity} />;
    },
  },
  {
    accessorKey: "created_at",
    header: () => <p className="px-2">Created at</p>,
    cell: ({ row }) => {
      const created_at = row.original.created_at;
      if (!created_at) return;

      return <DateCell date={created_at} />;
    },
  },
];
