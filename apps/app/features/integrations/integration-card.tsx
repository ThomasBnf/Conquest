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
    name: string;
    description: string;
    soon: boolean;
  };
};

export const IntegrationCard = ({ integration }: Props) => {
  const { href, logo, name, description, soon } = integration;

  const { data } = trpc.integrations.getIntegrationBySource.useQuery({
    source: name.toUpperCase() as Source,
  });

  const isConnected = data?.status === "CONNECTED";
  const isSyncing = data?.status === "SYNCING";
  const isDisconnected = data?.status === "DISCONNECTED";

  return (
    <Link
      href={soon ? "" : href}
      key={name}
      className={cn(
        "relative flex items-start gap-4 rounded-md border p-4 transition-colors hover:bg-muted-hover",
        soon && "cursor-not-allowed",
      )}
    >
      <div className={cn(soon && "opacity-50")}>{logo}</div>
      <div className={cn(soon && "opacity-50")}>
        <p className="font-medium text-lg leading-tight">{name}</p>
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
      {soon && (
        <Badge variant="secondary" className="absolute top-2 right-2">
          Coming soon
        </Badge>
      )}
    </Link>
  );
};
