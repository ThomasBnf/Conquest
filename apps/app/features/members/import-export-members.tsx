import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Loader2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { unparse } from "papaparse";

type Props = {
  members: Member[] | undefined;
};

export const ExportListMembers = ({ members }: Props) => {
  const { mutateAsync, isPending } = trpc.members.export.useMutation();
  const { slug } = useWorkspace();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <ArrowUpDown size={16} />
              Import / Export
              <ChevronDown size={16} className="text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem onClick={onExport}>
          <Download size={16} />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href={`/${slug}/members/import`}
            className="flex items-center gap-2"
            prefetch
          >
            <Upload size={16} />
            Import from CSV
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
