import { AlertDialog } from "@/components/custom/alert-dialog";
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
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect, useState } from "react";

type Props = {
  integration: Integration | undefined;
  name: string | undefined;
  onDisconnect: () => Promise<string | number | undefined>;
};

export const ConnectedCard = ({
  integration,
  name,
  onDisconnect,
  children,
}: PropsWithChildren<Props>) => {
  const { status, connected_at } = integration ?? {};
  const isConnected = status === "CONNECTED";
  const router = useRouter();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    router.refresh();
  }, []);

  if (!isConnected) return null;

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
                  Connected on {format(connected_at, "PP")}
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
