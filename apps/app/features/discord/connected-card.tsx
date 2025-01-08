"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { AlertDialog } from "@/components/custom/alert-dialog";
import { useUser } from "@/context/userContext";
import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ConnectedCard = () => {
  const { discord } = useUser();
  const { connected_at } = discord ?? {};

  const [open, setOpen] = useState(false);

  const onDisconnect = async () => {
    if (!discord) return;

    const response = await deleteIntegration({
      integration: discord,
      source: "DISCORD",
    });

    const error = response?.serverError;

    if (error) toast.error(error);
    return toast.success("Discord disconnected");
  };

  if (discord?.status !== "CONNECTED") return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-base">
            Connected workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="mb-0.5">
          <div className=" flex items-end justify-between">
            <div>
              <p className="font-medium">Discord</p>
              {connected_at && (
                <p className="text-muted-foreground">
                  Connected on {format(connected_at, "PP")}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <div className="size-2.5 rounded-full bg-green-500" />
                  <p>Connected</p>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <div className="size-2.5 rounded-full bg-red-500" />
                  <p>Disconnect Discord</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <AlertDialog
        title="Disconnect Discord"
        description="Discord integration will be removed from your workspace and all your data will be deleted."
        onConfirm={onDisconnect}
        open={open}
        setOpen={setOpen}
        buttonLabel="Disconnect"
      />
    </>
  );
};
