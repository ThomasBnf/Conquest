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
} from "@conquest/ui/src/components/dropdown-menu";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ConnectedCard = () => {
  const { discourse } = useUser();
  const { connected_at } = discourse ?? {};

  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onDisconnect = async () => {
    if (!discourse) return;

    const response = await deleteIntegration({
      integration: discourse,
      source: "DISCOURSE",
    });

    const error = response?.serverError;

    if (error) toast.error(error);
    return toast.success("Discourse disconnected");
  };

  useEffect(() => {
    router.refresh();
  }, []);

  if (discourse?.status !== "CONNECTED") return;

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
              <p className="font-medium">Discourse</p>
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
                  <p>Disconnect Discourse</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <AlertDialog
        title="Disconnect Discourse workspace"
        description="Discourse integration will be removed from your workspace and all your data will be deleted."
        onConfirm={onDisconnect}
        open={open}
        setOpen={setOpen}
        buttonLabel="Disconnect"
      />
    </>
  );
};
