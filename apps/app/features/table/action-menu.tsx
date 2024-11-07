import { DeleteDialog } from "@/components/custom/delete-dialog";
import { _deleteListMembers } from "@/features/members/actions/_deleteListMembers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
  rowSelected: string[];
  setRowSelected: (ids: string[]) => void;
  count: number;
};

export const ActionMenu = ({ rowSelected, setRowSelected, count }: Props) => {
  const queryClient = useQueryClient();

  const onDeleteMembers = async () => {
    const ids = rowSelected.map((id) => {
      return id;
    });

    const result = await _deleteListMembers({ ids });
    const error = result?.serverError;

    if (error) return toast.error(error);
    toast.success("Members deleted");
    queryClient.invalidateQueries({ queryKey: ["members"] });
    setRowSelected([]);
  };

  return (
    <div className="absolute bottom-10 inset-x-0 w-fit mx-auto">
      <div className="bg-foreground border border-foreground text-background pl-2.5 pr-1 py-1 rounded-lg flex items-center actions-primary divide-background/50 overflow-hidden">
        <p className="border-r pr-2 border-r-background/30 py-1">
          {rowSelected.length}
          <span className="text-muted-foreground mx-1">of</span>
          {count}
          <span className="text-muted-foreground ml-1">selected</span>
        </p>
        <DeleteDialog
          title="Delete Members"
          description="Are you sure you want to delete these members?"
          onConfirm={onDeleteMembers}
          className="ml-2"
        />
      </div>
    </div>
  );
};
