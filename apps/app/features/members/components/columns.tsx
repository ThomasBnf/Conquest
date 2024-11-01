import { DateCell } from "@/components/custom/date-cell";
import { useUser } from "@/context/userContext";
import { TagBadge } from "@/features/tags/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import type {
  Activity,
  MemberWithActivities,
} from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Header } from "./table-header";

type Props = {
  tags: Tag[] | undefined;
};

export const Columns = ({ tags }: Props): ColumnDef<MemberWithActivities>[] => [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center bg-secondary h-full">
        <Checkbox
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          onClick={(value) => {
            if (table.getIsAllRowsSelected()) {
              table.toggleAllRowsSelected(false);
            } else {
              table.toggleAllRowsSelected(!!value);
            }
          }}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    size: 50,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => <Header column={column} title="Name" />,
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
    header: ({ column }) => <Header column={column} title="Email" />,
    cell: ({ row }) => {
      return <p>{row.original.emails[0]}</p>;
    },
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
        .sort((a, b) => b.created_at?.getTime() - a.created_at.getTime())
        .at(0)?.created_at;

      if (!lastActivity) return;
      return <DateCell date={lastActivity} />;
    },
    sortingFn: (rowA, rowB) => {
      const getLastActivity = (activities: Activity[]) => {
        return activities.length > 0
          ? Math.max(...activities.map((a) => a.created_at.getTime()))
          : Number.NEGATIVE_INFINITY;
      };

      const lastActivityTimeA = getLastActivity(rowA.original.activities);
      const lastActivityTimeB = getLastActivity(rowB.original.activities);

      return lastActivityTimeB - lastActivityTimeA;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <Header column={column} title="Created at" />,
    cell: ({ row }) => {
      const created_at = row.original.created_at;
      if (!created_at) return;

      return <DateCell date={created_at} />;
    },
    sortingFn: (rowA, rowB) => {
      const created_atA = rowA.original.created_at;
      const created_atB = rowB.original.created_at;

      if (!created_atA && !created_atB) return 0;
      if (!created_atA) return 1;
      if (!created_atB) return -1;

      return new Date(created_atA).getTime() - new Date(created_atB).getTime();
    },
  },
];
