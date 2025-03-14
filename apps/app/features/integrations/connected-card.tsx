import { AlertDialog } from "@/components/custom/alert-dialog";
import { useIntegration } from "@/context/integrationContext";
import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { type PropsWithChildren, useState } from "react";

type Props = {
  integration: Integration | null;
  name: string | undefined;
};

export const ConnectedCard = ({
  integration,
  name,
  children,
}: PropsWithChildren<Props>) => {
  const { deleteIntegration } = useIntegration();
  const { status, connected_at } = integration ?? {};
  const [open, setOpen] = useState(false);

  const onDisconnect = async () => {
    if (!integration) return;
    await deleteIntegration({ integration });
  };

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
