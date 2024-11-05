import { useUser } from "@/context/userContext";
import { Header } from "@/features/members/components/table-header";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import type { Company } from "@conquest/zod/company.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export const Columns = (): ColumnDef<Company>[] => [
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
    accessorKey: "name",
    header: ({ column }) => <Header column={column} title="Name" />,
    cell: ({ row }) => {
      const { slug } = useUser();
      const { name } = row.original;
      const router = useRouter();

      return (
        <Button
          variant="ghost"
          onClick={() => router.push(`/${slug}/companies/${row.original.id}`)}
          className="flex items-center gap-2 px-1.5"
        >
          <p className="font-medium">{name}</p>
        </Button>
      );
    },
  },
];
