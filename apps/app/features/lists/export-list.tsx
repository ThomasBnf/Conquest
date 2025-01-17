import { sleep } from "@/helpers/sleep";
import { Button } from "@conquest/ui/button";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { Download } from "lucide-react";
import { unparse } from "papaparse";
import { useState } from "react";
import { parseData } from "./helpers/parseData";

type Props = {
  members: MemberWithCompany[] | undefined;
};

export const ExportList = ({ members }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!members?.length) return;

  const onExport = async () => {
    if (!members?.length) return;

    setLoading(true);
    await sleep(500);
    const transformedMembers = members.map(parseData);

    const csv = unparse(transformedMembers);

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
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={onExport}
      loading={loading}
      disabled={loading}
      className="csv"
    >
      <Download size={16} />
      Export
    </Button>
  );
};
