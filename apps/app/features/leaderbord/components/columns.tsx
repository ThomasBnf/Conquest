import { DateCell } from "@/components/custom/date-cell";
import { useUser } from "@/context/userContext";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export const Columns = (
  tags: Tag[] | undefined,
): ColumnDef<MemberWithActivities>[] => [
  {
    accessorKey: "place",
    header: () => (
      <p className="text-center h-full place-content-center">Place</p>
    ),
    cell: ({ row, table }) => {
      const rowIndex = table
        .getRowModel()
        .rows.findIndex((r) => r.id === row.id);
      return <p className="text-center">{rowIndex + 4}</p>;
    },
    size: 60,
  },
  {
    accessorKey: "full_name",
    header: () => <p className="px-2 h-full place-content-center">Name</p>,
    cell: ({ row }) => {
      const { slug } = useUser();
      const { avatar_url, first_name, full_name } = row.original;
      const router = useRouter();

      return (
        <Button
          variant="ghost"
          onClick={() => router.push(`/${slug}/members/${row.original.id}`)}
          className="flex items-center gap-2 px-1.5"
        >
          <Avatar className="size-6">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium">{full_name}</p>
        </Button>
      );
    },
  },
  {
    accessorKey: "emails",
    header: () => <p className="px-2 h-full place-content-center">Email</p>,
    cell: ({ row }) => {
      return <p>{row.original.emails[0]}</p>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "source",
    header: () => <p className="px-2 h-full place-content-center">Source</p>,
    cell: ({ row }) => {
      return <p>{row.original.source}</p>;
    },
  },
  {
    accessorKey: "tags",
    header: () => <p className="px-2 h-full place-content-center">Tags</p>,
    cell: ({ row }) => {
      const memberTags = tags?.filter((tag) =>
        row.original.tags.includes(tag.id),
      );

      return (
        <div className="flex flex-wrap gap-1">
          {memberTags?.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "activities",
    header: () => (
      <p className="px-2 h-full place-content-center">Activities</p>
    ),
    cell: ({ row }) => {
      return <p>{row.original.activities.length}</p>;
    },
  },
  {
    accessorKey: "last_activity",
    header: () => (
      <p className="px-2 h-full place-content-center">Last activity</p>
    ),
    cell: ({ row }) => {
      const lastActivity = row.original.activities
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .at(-1)?.created_at;

      return <DateCell date={lastActivity} />;
    },
  },
  {
    accessorKey: "created_at",
    header: () => (
      <p className="px-2 h-full place-content-center">Created at</p>
    ),
    cell: ({ row }) => {
      const created_at = row.original.created_at;

      return <DateCell date={created_at} />;
    },
  },
];
