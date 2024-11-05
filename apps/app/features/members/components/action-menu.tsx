import { _deleteListMembers } from "@/features/members/actions/_deleteListMembers";
import { Button } from "@conquest/ui/button";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { useQueryClient } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Props<T> = {
  table: Table<T>;
};

export const ActionMenu = <T,>({ table }: Props<T>) => {
  const queryClient = useQueryClient();

  const onDeleteMembers = async () => {
    const ids = table.getSelectedRowModel().rows.map((row) => {
      const member = MemberWithActivitiesSchema.parse(row.original);
      return member.id;
    });

    const result = await _deleteListMembers({ ids });
    const error = result?.serverError;

    if (error) return toast.error(error);
    toast.success("Members deleted");
    queryClient.invalidateQueries({ queryKey: ["members"] });
    table.resetRowSelection();
  };

  return (
    <div className="absolute bg-background bottom-10 inset-x-0 border shadow-lg rounded-md w-fit mx-auto">
      <div className="bg-muted/30 p-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="rounded-md border bg-main-500 text-white flex items-center justify-center p-0.5 min-w-5 font-mono text-xs">
            {table.getSelectedRowModel().rows.length}
          </p>
          <p className="text-muted-foreground text-xs">selected</p>
        </div>
        <Button onClick={onDeleteMembers} variant="outline">
          <Trash2 size={16} />
          Delete {table.getSelectedRowModel().rows.length} members
        </Button>
        <Button
          onClick={() => table.resetRowSelection()}
          variant="ghost"
          size="icon"
          className="ml-auto"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};
