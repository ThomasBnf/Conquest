import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  workflowId: string;
};

export const WorkflowTabs = ({ workflowId }: Props) => {
  const { slug } = useWorkspace();
  const pathname = usePathname();

  const { data } = trpc.runs.count.useQuery({ workflowId });

  const tabs = [
    {
      label: "Editor",
      href: `/${slug}/workflows/${workflowId}/editor`,
      active: pathname.includes("editor"),
    },
    {
      label: "Runs",
      href: `/${slug}/workflows/${workflowId}/runs`,
      active: pathname.includes("runs"),
    },
  ];

  return (
    <div className="flex min-h-10 items-center gap-2 px-4">
      {tabs.map((tab) => (
        <div key={tab.href}>
          <Link
            href={tab.href}
            prefetch
            className={cn(
              "flex h-7 place-content-center items-center gap-1 rounded-md border px-1.5 transition-colors hover:bg-muted",
              tab.active
                ? "border-border text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            <p>{tab.label}</p>
            {tab.label === "Runs" && (
              <Badge variant="secondary" className="size-4 text-[11px]">
                {data}
              </Badge>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
};
