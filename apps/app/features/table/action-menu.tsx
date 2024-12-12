import { DeleteDialog } from "@/components/custom/delete-dialog";
import { _deleteListMembers } from "@/features/members/actions/_deleteListMembers";
import { Button } from "@conquest/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AddTagDialog } from "./add-tag-dialog";

type Props = {
  rowSelected: string[];
  setRowSelected: (ids: string[]) => void;
};

export const ActionMenu = ({ rowSelected, setRowSelected }: Props) => {
  const queryClient = useQueryClient();

  const onDeleteMembers = async () => {
    const ids = rowSelected.map((id) => id);

    const result = await _deleteListMembers({ ids });
    const error = result?.serverError;

    if (error) return toast.error(error);

    toast.success("Members deleted");
    queryClient.invalidateQueries({ queryKey: ["members"], exact: false });
    setRowSelected([]);
  };

  const onClearSelection = () => {
    setRowSelected([]);
  };

  return (
    <div className="absolute inset-x-0 bottom-10 mx-auto w-fit">
      <div className="actions-primary flex items-center divide-background/50 overflow-hidden rounded-lg border border-foreground bg-foreground py-1 pr-1 pl-2.5 text-background">
        <p className="border-r border-r-background/30 py-1 pr-2">
          {rowSelected.length}
          <span className="ml-1 text-muted-foreground">selected</span>
        </p>
        <div className="ml-2 flex items-center gap-1.5">
          <AddTagDialog
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
          />
          <DeleteDialog
            title="Delete Members"
            description="Are you sure you want to delete these members?"
            onConfirm={onDeleteMembers}
          />
          <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
