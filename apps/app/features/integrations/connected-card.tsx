import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Source } from "@conquest/zod/enum/source.enum";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  integration: Integration | null;
  name: string | undefined;
  source: Source | undefined;
};

export const ConnectedCard = ({
  integration,
  name,
  source,
  children,
}: PropsWithChildren<Props>) => {
  const { status, connected_at } = integration ?? {};
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync: deleteIntegration } =
    trpc.integrations.delete.useMutation({
      onSuccess: () => {
        toast.success(`${source} disconnected`);
        utils.channels.list.invalidate({ source });
        utils.events.list.invalidate({ source });
        utils.integrations.bySource.invalidate({ source });
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
    router.refresh();
  }, []);

  if (status !== "CONNECTED") return null;

  return (
    <>
      <AlertDialog
        title={`Disconnect ${name}`}
        description="Integration will be removed from your workspace and all your data will be deleted."
        onConfirm={onDisconnect}
        open={open}
        setOpen={setOpen}
        buttonLabel="Disconnect"
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-base">
            Connected workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="mb-0.5">
          <div className=" flex items-end justify-between">
            <div>
              <p className="font-medium">{name}</p>
              {connected_at && (
                <p className="text-muted-foreground">
                  Connected on {format(connected_at, "PPp")}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <div className="size-2.5 rounded-full bg-green-500" />
                  <p>Connected</p>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <div className="size-2.5 rounded-full bg-red-500" />
                  <p>Disconnect {name}</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {children}
        </CardContent>
      </Card>
    </>
  );
};
