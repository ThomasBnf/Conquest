import { DeleteDialog } from "@/components/custom/delete-dialog";
import { MergeDialog } from "@/features/merge/merge-dialog";
import { TagDialog } from "@/features/table/tag-dialog";
import { useTable } from "@/hooks/useTable";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { BulkActivityDialog } from "../bulk-activity-dialog";

type Props<TData extends Member | Company> = {
  table: ReturnType<typeof useTable<TData>>;
};

export const ActionsMenu = <TData extends Member | Company>({
  table,
}: Props<TData>) => {
  const { data, isSomeSelected, has2Selected, selectedRows, onReset } = table;
  const utils = trpc.useUtils();
  const isMember = data[0] && "firstName" in data[0];

  const pathname = usePathname();
  const isCompanyPage = pathname.includes("companies");

  const { mutateAsync: deleteMembers } =
    trpc.members.deleteManyMembers.useMutation({
      onSuccess: () => {
        utils.members.list.invalidate();
        toast.success(`${selectedRows.length} members deleted`);
        onReset();
      },
    });

  const { mutateAsync: deleteCompanies } =
    trpc.companies.deleteManyCompanies.useMutation({
      onSuccess: () => {
        utils.companies.list.invalidate();
        toast.success(`${selectedRows.length} companies deleted`);
        onReset();
      },
    });

  const onDelete = async () => {
    const ids = selectedRows.map((item) => item.id);

    if (data[0] && "firstName" in data[0]) {
      await deleteMembers({ ids });
      return;
    }

    await deleteCompanies({ ids });
  };

  if (!isSomeSelected) return;

  return (
    <div className="absolute inset-x-0 bottom-28 mx-auto w-fit">
      <div className="flex items-center gap-1.5 rounded-lg border bg-sidebar p-1 shadow-lg">
        <TagDialog table={table} />
        {!isCompanyPage && (
          <BulkActivityDialog
            members={selectedRows as Member[]}
            onReset={onReset}
          />
        )}
        {!isCompanyPage && has2Selected && (
          <MergeDialog members={selectedRows as Member[]} onReset={onReset} />
        )}
        <div className="flex flex-1 items-center justify-end gap-1.5">
          <Separator orientation="vertical" className="h-7" />
          <DeleteDialog
            title={`Delete ${
              isMember
                ? `${selectedRows.length} member${
                    selectedRows.length > 1 ? "s" : ""
                  }`
                : `${selectedRows.length} compan${
                    selectedRows.length > 1 ? "ies" : "y"
                  }`
            }`}
            description={
              isMember
                ? `Are you sure? This will remove the ${
                    selectedRows.length > 1 ? "members" : "member"
                  } from all lists and from associated companies.`
                : `Are you sure? This will remove the ${
                    selectedRows.length > 1 ? "companies" : "company"
                  } from the workspace.`
            }
            onConfirm={onDelete}
            onCancel={onReset}
          />
          <Button variant="ghost" onClick={onReset}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
