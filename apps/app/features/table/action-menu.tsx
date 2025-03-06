import { DeleteDialog } from "@/components/custom/delete-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { AddTagDialog } from "./cells/add-tag-dialog";
import { RemoveTagDialog } from "./cells/remove-tag-dialog";

type Props<TData> = {
  table: Table<TData>;
};

export const ActionMenu = <TData,>({ table }: Props<TData>) => {
  const pathname = usePathname();
  const isCompanyPage = pathname.includes("companies");
  const utils = trpc.useUtils();

  const rowSelected = table.getSelectedRowModel().rows;
  const hasMultipleRows = rowSelected.length > 1;

  const { mutateAsync: deleteMembers } =
    trpc.members.deleteManyMembers.useMutation({
      onSuccess: () => {
        utils.members.list.invalidate();
        utils.members.count.invalidate();
        toast.success(` ${hasMultipleRows ? "members" : "member"} deleted`);
        table.setRowSelection({});
      },
    });

  const { mutateAsync: deleteCompanies } =
    trpc.companies.deleteManyCompanies.useMutation({
      onSuccess: () => {
        utils.companies.list.invalidate();
        utils.companies.countCompanies.invalidate();
        toast.success(` ${hasMultipleRows ? "companies" : "company"} deleted`);
        table.setRowSelection({});
      },
    });

  const onDelete = async () => {
    if (isCompanyPage) {
      const companyIds = rowSelected.map(
        (row) => CompanySchema.parse(row.original).id,
      );
      await deleteCompanies({ ids: companyIds });
    } else {
      const memberIds = rowSelected.map(
        (row) => MemberSchema.parse(row.original).id,
      );
      await deleteMembers({ ids: memberIds });
    }
  };

  const onClearSelection = () => table.setRowSelection({});

  if (rowSelected.length === 0) return;

  return (
    <div className="absolute inset-x-0 bottom-10 mx-auto w-fit">
      <div className="actions-primary flex items-center divide-background/50 overflow-hidden rounded-lg border border-foreground bg-foreground py-1 pr-1 pl-2.5 text-background">
        <p className="border-r border-r-background/30 py-1 pr-2">
          {rowSelected.length}
          <span className="ml-1 text-muted-foreground">selected</span>
        </p>
        <div className="ml-2 flex items-center gap-1.5">
          <AddTagDialog table={table} />
          <RemoveTagDialog table={table} />
          <DeleteDialog
            title={`Delete ${hasMultipleRows ? "members" : "member"}`}
            description={`Are you sure you want to delete ${hasMultipleRows ? "these members" : "this member"}?`}
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
