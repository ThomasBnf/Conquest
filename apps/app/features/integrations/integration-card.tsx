import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import type { Source } from "@conquest/zod/enum/source.enum";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  integration: {
    href: string;
    logo: ReactNode;
    source: Source;
    description: string;
    soon: boolean;
  };
};

export const IntegrationCard = ({ integration }: Props) => {
  const { href, logo, source, description, soon } = integration;

  const { data } = trpc.integrations.bySource.useQuery({
    source,
  });

  const isConnected = data?.status === "CONNECTED";
  const isSyncing = data?.status === "SYNCING";
  const isDisconnected = data?.status === "DISCONNECTED";
  const isFailed = data?.status === "FAILED";

  return (
    <Link
      href={soon ? "" : href}
      key={source}
      className={cn(
        "relative flex items-start gap-4 rounded-md border p-4 transition-colors hover:bg-muted",
        soon && "cursor-not-allowed",
      )}
    >
      <div className={cn(soon && "opacity-50")}>{logo}</div>
      <div className={cn(soon && "opacity-50")}>
        <p className="font-medium text-lg leading-tight">{source}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {isConnected && (
        <Badge variant="success" className="absolute top-2 right-2">
          Connected
        </Badge>
      )}
      {isSyncing && (
        <Badge variant="secondary" className="absolute top-2 right-2">
          <Loader2 className="mr-1 size-3 animate-spin" />
          Syncing
        </Badge>
      )}
      {isSyncing && (
        <Badge variant="secondary" className="absolute top-2 right-2">
          <Loader2 className="mr-1 size-3 animate-spin" />
          Syncing
        </Badge>
      )}
      {isDisconnected && (
        <Badge variant="destructive" className="absolute top-2 right-2">
          Disconnected
        </Badge>
      )}
      {isFailed && (
        <Badge variant="destructive" className="absolute top-2 right-2">
          Failed
        </Badge>
      )}
      {soon && (
        <Badge variant="secondary" className="absolute top-2 right-2">
          Coming soon
        </Badge>
      )}
    </Link>
  );
};
