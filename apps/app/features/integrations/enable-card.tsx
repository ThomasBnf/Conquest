import { useIntegration } from "@/context/integrationContext";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import type { Source } from "@conquest/zod/enum/source.enum";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { CirclePlus, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "../../../../packages/ui/src/lib/utils";
import { DisconnectButton } from "./disconnect-button";

type Props = {
  error: string;
  integration: Integration | null;
  description: string;
  docUrl: string;
  source: Source;
  onEnable: () => void;
};

export const EnableCard = ({
  error,
  integration,
  docUrl,
  description,
  source,
  onEnable,
  children,
}: PropsWithChildren<Props>) => {
  const { loading } = useIntegration();
  const { status, triggerToken, expiresAt } = integration ?? {};
  const router = useRouter();

  const isEnabled = status === "ENABLED";
  const isSyncing = status === "SYNCING";
  const isConnected = status === "CONNECTED";
  const isExpired = expiresAt && expiresAt < new Date();

  useEffect(() => {
    if (error) {
      switch (error) {
        case "access_denied":
          toast.error("Error: Access denied", { duration: 10000 });
          break;
        case "invalid_code":
          toast.error("Error: Invalid code", { duration: 10000 });
          break;
        case "creating_integration":
          toast.error("Error: Failed to create integration", {
            duration: 10000,
          });
          break;
        case "already_connected":
          toast.error(
            "Error: This integration is already connected to another workspace",
            { duration: 10000 },
          );
          break;
      }
      router.replace(`/settings/integrations/${source.toLowerCase()}`);
    }
  }, [expiresAt, error]);

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
        {(!triggerToken || isExpired) && (
          <Button onClick={onEnable} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <CirclePlus size={16} />
                Enable
              </>
            )}
          </Button>
        )}
        {isEnabled && !loading && !isExpired && (
          <DisconnectButton integration={integration} />
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
