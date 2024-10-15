import { deleteContacts } from "@/actions/contacts/deleteContacts";
import { ContactWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { Button } from "@conquest/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Props<T> = {
  table: Table<T>;
};

export const BottomMenuAction = <T,>({ table }: Props<T>) => {
  const queryClient = useQueryClient();

  const onDeleteContacts = async () => {
    const ids = table.getSelectedRowModel().rows.map((row) => {
      const contact = ContactWithActivitiesSchema.parse(row.original);
      return contact.id;
    });

    const result = await deleteContacts({ ids });
    const error = result?.serverError;

    if (error) return toast.error(error);
    toast.success("Contacts deleted");
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    table.resetRowSelection();
  };

  return (
    <div className="absolute bg-background bottom-10 inset-x-0 border shadow-lg rounded-lg w-fit mx-auto">
      <div className="bg-muted/30 p-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="rounded border bg-main-500 text-white flex items-center justify-center p-0.5 min-w-5 font-mono text-xs">
            {table.getSelectedRowModel().rows.length}
          </p>
          <p className="text-muted-foreground text-xs">selected</p>
        </div>
        <Button onClick={onDeleteContacts} variant="outline">
          <Trash2 size={16} />
          Delete {table.getSelectedRowModel().rows.length} contacts
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
