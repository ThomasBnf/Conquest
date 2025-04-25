import { useIntegration } from "@/context/integrationContext";
import { Button } from "@conquest/ui/button";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  integration: Integration | null | undefined;
};

export const DisconnectButton = ({ integration }: Props) => {
  const [loading, setLoading] = useState(false);
  const { deleteIntegration } = useIntegration();
  const { expiresAt } = integration ?? {};

  const onDisconnect = async () => {
    if (!integration) return;

    setLoading(true);
    await deleteIntegration({ integration });
    setTimeout(() => setLoading(false), 2000);
  };

  useEffect(() => {
    if (expiresAt && expiresAt < new Date()) {
      onDisconnect();
    }
  }, [expiresAt]);

  return (
    <Button variant="destructive" onClick={onDisconnect} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : "Disconnect"}
    </Button>
  );
};
