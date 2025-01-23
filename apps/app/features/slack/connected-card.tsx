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
import { Separator } from "@conquest/ui/separator";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  channels: Channel[];
};

export const ConnectedCard = ({ channels }: Props) => {
  const { slack } = useUser();
  const { details, connected_at } = slack ?? {};
  const { name } = details ?? {};

  const [open, setOpen] = useState(false);

  const onDisconnect = async () => {
    if (!slack) return;

    const response = await deleteIntegration({
      integration: slack,
      source: "SLACK",
    });

    const error = response?.serverError;

    if (error) toast.error(error);
    return toast.success("Slack disconnected");
  };

  if (slack?.status !== "CONNECTED") return null;

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
              <p className="font-medium">{name}</p>
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
                  <p>Disconnect {name}</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator className="my-4" />
          <div>
            <p className="mb-2 font-medium">Channels</p>
            <div className="space-y-1">
              {channels?.map((channel) => (
                <p key={channel.id}># {channel.name}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog
        title={`Disconnect ${name} workspace`}
        description="Slack integration will be removed from your workspace and all your data will be deleted."
        onConfirm={onDisconnect}
        open={open}
        setOpen={setOpen}
        buttonLabel="Disconnect"
      />
    </>
  );
};
