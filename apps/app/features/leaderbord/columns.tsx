import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DateCell } from "../members/date-cell";
import { TagBadge } from "../tags/tag-badge";

export const Columns = (
  tags: Tag[] | undefined,
): ColumnDef<MemberWithActivities>[] => [
  {
    accessorKey: "place",
    header: () => (
      <p className="text-center bg-background h-full place-content-center">
        Place
      </p>
    ),
    cell: ({ row, table }) => {
      const rowIndex = table
        .getRowModel()
        .rows.findIndex((r) => r.id === row.id);
      return <p className="text-center">{rowIndex + 4}</p>;
    },
  },
  {
    accessorKey: "full_name",
    header: () => (
      <p className="px-2 bg-background h-full place-content-center">Name</p>
    ),
    cell: ({ row }) => {
      const { slug } = useUser();
      const { avatar_url, first_name, full_name } = row.original;

      return (
        <Link
          href={`/${slug}/members/${row.original.id}`}
          className={cn(buttonVariants({ variant: "ghost" }), "space-x-2")}
        >
          <Avatar className="size-6">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium">{full_name}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "emails",
    header: () => (
      <p className="px-2 bg-background h-full place-content-center">Email</p>
    ),
    cell: ({ row }) => {
      return <p>{row.original.emails[0]}</p>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "source",
    header: () => (
      <p className="px-2 bg-background h-full place-content-center">Source</p>
    ),
    cell: ({ row }) => {
      return <p>{row.original.source}</p>;
    },
  },
  {
    accessorKey: "tags",
    header: () => (
      <p className="px-2 bg-background h-full place-content-center">Tags</p>
    ),
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
      <p className="px-2 bg-background h-full place-content-center">
        Activities
      </p>
    ),
    cell: ({ row }) => {
      return <p>{row.original.activities.length}</p>;
    },
  },
  {
    accessorKey: "last_activity",
    header: () => (
      <p className="px-2 bg-background h-full place-content-center">
        Last activity
      </p>
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
      <p className="px-2 bg-background h-full place-content-center">
        Created at
      </p>
    ),
    cell: ({ row }) => {
      const created_at = row.original.created_at;

      return <DateCell date={created_at} />;
    },
  },
];
