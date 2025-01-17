import { deleteManyCompanies } from "@/actions/companies/deleteManyCompanies";
import { deleteManyMembers } from "@/actions/members/deleteManyMembers";
import { DeleteDialog } from "@/components/custom/delete-dialog";
import { Button } from "@conquest/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { AddTagDialog } from "./add-tag-dialog";
import { RemoveTagDialog } from "./remove-tag-dialog";

type Props = {
  rowSelected: string[];
  setRowSelected: (ids: string[]) => void;
  table: "members" | "companies";
};

export const ActionMenu = ({ rowSelected, setRowSelected, table }: Props) => {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const onDelete = async () => {
    if (pathname.includes("members")) {
      await onDeleteMembers();
    } else if (pathname.includes("companies")) {
      return await onDeleteCompanies();
    }
  };

  const onDeleteMembers = async () => {
    const ids = rowSelected.map((id) => id);

    const result = await deleteManyMembers({ ids });
    const error = result?.serverError;

    if (error) return toast.error(error);

    toast.success("Members deleted");
    queryClient.invalidateQueries({ queryKey: ["members"], exact: false });
    setRowSelected([]);
  };

  const onClearSelection = () => {
    setRowSelected([]);
  };

  const onDeleteCompanies = async () => {
    const ids = rowSelected.map((id) => id);

    const result = await deleteManyCompanies({ ids });
    const error = result?.serverError;

    if (error) return toast.error(error);

    toast.success("Companies deleted");
    queryClient.invalidateQueries({ queryKey: ["companies"], exact: false });
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
            table={table}
          />
          <RemoveTagDialog
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            table={table}
          />
          <DeleteDialog
            title="Delete Members"
            description="Are you sure you want to delete these members?"
            onConfirm={onDelete}
          />
          <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
