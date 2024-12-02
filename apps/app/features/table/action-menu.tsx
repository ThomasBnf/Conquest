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
    queryClient.invalidateQueries({ queryKey: ["members"], exact: false });
    setRowSelected([]);
  };

  return (
    <div className="absolute inset-x-0 bottom-10 mx-auto w-fit">
      <div className="actions-primary flex items-center divide-background/50 overflow-hidden rounded-lg border border-foreground bg-foreground py-1 pr-1 pl-2.5 text-background">
        <p className="border-r border-r-background/30 py-1 pr-2">
          {rowSelected.length}
          <span className="mx-1 text-muted-foreground">of</span>
          {count}
          <span className="ml-1 text-muted-foreground">selected</span>
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
