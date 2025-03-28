import { DeleteDialog } from "@/components/custom/delete-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import type { Table } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { AddTagDialog } from "./cells/add-tag-dialog";
import { RemoveTagDialog } from "./cells/remove-tag-dialog";

type Props<TData> = {
  table: Table<TData>;
};

export const ActionsMenu = <TData,>({ table }: Props<TData>) => {
  const pathname = usePathname();
  const isCompanyPage = pathname.includes("companies");
  const utils = trpc.useUtils();

  const rowSelected = table.getSelectedRowModel().rows;
  const hasMultipleRows = rowSelected.length > 1;
  const hasSomeSelected = table.getIsSomeRowsSelected();
  const hasAllSelected = table.getIsAllRowsSelected();
  const hasSelectedMembers = hasSomeSelected || hasAllSelected;
  const hasTwoSelected = rowSelected.length === 2;

  const { mutateAsync: deleteMembers } =
    trpc.members.deleteManyMembers.useMutation({
      onSuccess: () => {
        table.setRowSelection({});
        utils.members.list.invalidate();
        utils.members.count.invalidate();
        toast.success(
          `${hasMultipleRows ? `${rowSelected.length} members` : "member"} deleted`,
        );
      },
    });

  const { mutateAsync: deleteCompanies } =
    trpc.companies.deleteManyCompanies.useMutation({
      onSuccess: () => {
        table.setRowSelection({});
        utils.companies.list.invalidate();
        utils.companies.countCompanies.invalidate();
        toast.success(
          `${hasMultipleRows ? `${rowSelected.length} companies` : "company"} deleted`,
        );
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

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 overflow-hidden px-3 transition-all duration-300 ease-in-out",
        hasSelectedMembers ? "h-12 opacity-100" : "h-0 opacity-0",
      )}
    >
      <AddTagDialog table={table} />
      <RemoveTagDialog table={table} />
      {/* {hasTwoSelected && (
        <>
          <Separator orientation="vertical" className="h-7" />
          <Button variant="outline">
            <Merge size={16} />
            Merge
          </Button>
        </>
      )} */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => table.toggleAllRowsSelected(false)}
        >
          Unselect
        </Button>
        <Separator orientation="vertical" className="h-7" />
        <DeleteDialog
          title={`Delete ${hasMultipleRows ? `${rowSelected.length} members` : "member"}`}
          description={
            isCompanyPage
              ? "Are you sure? This will remove the company from all lists and from associated members."
              : "Are you sure? This will remove the member from all lists and delete their activities and profiles."
          }
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
};
