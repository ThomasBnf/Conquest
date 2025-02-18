import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Download } from "lucide-react";
import { unparse } from "papaparse";

type Props = {
  members: Member[] | undefined;
};

export const ExportListMembers = ({ members }: Props) => {
  const { mutateAsync, isPending } = trpc.members.exportMembers.useMutation();

  const onExport = async () => {
    if (!members?.length) return;
    const transformedData = await mutateAsync({ members });

    const csv = unparse(transformedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date().toISOString().split("T")[0];

    link.href = url;
    link.setAttribute("download", `members_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={onExport}
      loading={isPending}
      disabled={isPending}
      className="csv"
    >
      <Download size={16} />
      Export
    </Button>
  );
};
