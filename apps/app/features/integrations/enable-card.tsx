import { useUser } from "@/context/userContext";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { CirclePlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  error: string;
  integration: Integration | undefined;
  description: string;
  docUrl: string;
  loading: boolean;
  onEnable: () => void;
  onDisconnect: () => void;
};

export const EnableCard = ({
  error,
  integration,
  docUrl,
  description,
  loading,
  onEnable,
  onDisconnect,
  children,
}: PropsWithChildren<Props>) => {
  const { slug } = useUser();
  const { status, trigger_token, trigger_token_expires_at } = integration ?? {};
  const pathname = usePathname();
  const source = pathname.split("/").pop();
  const router = useRouter();

  const isEnabled = status === "ENABLED";
  const isSyncing = status === "SYNCING";
  const isConnected = status === "CONNECTED";
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  useEffect(() => {
    if (trigger_token_expires_at && trigger_token_expires_at < new Date()) {
      onDisconnect();
    }

    if (error) {
      switch (error) {
        case "access_denied":
          toast.error("Error: Access denied", { duration: 10000 });
          break;
        case "invalid_code":
          toast.error("Error: Invalid code", { duration: 10000 });
          break;
        case "already_connected":
          toast.error(
            "Error: This integration is already connected to another account",
            { duration: 10000 },
          );
          break;
      }
      router.replace(`/${slug}/settings/integrations/${source}`);
    }
  }, [trigger_token_expires_at, error]);

  if (isConnected) return;

  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <Link
            href={docUrl}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "link", size: "xs" }),
              "flex w-fit items-center gap-2 text-foreground",
            )}
          >
            <ExternalLink size={16} />
            <p>Documentation</p>
          </Link>
        </div>
        {(!trigger_token || isExpired) && (
          <Button onClick={onEnable} loading={loading} disabled={loading}>
            <CirclePlus size={16} />
            Enable
          </Button>
        )}
        {isEnabled && !loading && !isExpired && (
          <Button variant="destructive" onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </CardHeader>
      <CardContent className="mb-0.5">
        <p className="font-medium text-base">Overview</p>
        <p className="text-balance text-muted-foreground">{description}</p>
        {(isEnabled || isSyncing) && !isExpired && children}
      </CardContent>
    </Card>
  );
};
