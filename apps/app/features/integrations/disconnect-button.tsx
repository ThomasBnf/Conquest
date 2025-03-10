import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import type { Source } from "@conquest/zod/enum/source.enum";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

type Props = {
  source: Source;
  integration: Integration | null | undefined;
};

export const DisconnectButton = ({ source, integration }: Props) => {
  const { expires_at } = integration ?? {};
  const utils = trpc.useUtils();
  const router = useRouter();

  const { mutateAsync: deleteIntegration, isPending } =
    trpc.integrations.delete.useMutation({
      onSuccess: () => {
        toast.success(`${source} disconnected`);
        utils.channels.list.invalidate({ source });
        utils.integrations.bySource.cancel();
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onDisconnect = async () => {
    if (!integration) return;
    await deleteIntegration({ integration });
  };

  useEffect(() => {
    if (expires_at && expires_at < new Date()) {
      onDisconnect();
    }
  }, [expires_at]);

  return (
    <Button variant="destructive" onClick={onDisconnect} disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : "Disconnect"}
    </Button>
  );
};
