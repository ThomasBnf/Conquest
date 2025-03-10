import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import type { Company } from "@conquest/zod/schemas/company.schema";
import { Download, Loader2 } from "lucide-react";
import { unparse } from "papaparse";

type Props = {
  companies: Company[] | undefined;
};

export const ExportListCompanies = ({ companies }: Props) => {
  const { mutateAsync, isPending } = trpc.companies.export.useMutation();

  const onExport = async () => {
    if (!companies?.length) return;
    const transformedData = await mutateAsync({ companies });

    const csv = unparse(transformedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date().toISOString().split("T")[0];

    link.href = url;
    link.setAttribute("download", `companies_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={onExport}
      disabled={isPending}
      className="csv"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Download size={16} />
          Export
        </>
      )}
    </Button>
  );
};
