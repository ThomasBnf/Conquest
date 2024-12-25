"use client";

import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { AlertDialog } from "@/components/custom/alert-dialog";
import { Discourse } from "@/components/icons/Discourse";
import { useUser } from "@/context/userContext";
import { InstallForm } from "@/features/discourse/install-form";
import { IntegrationHeader } from "@/features/integrations/integration-header";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/src/components/dropdown-menu";
import { ScrollArea } from "@conquest/ui/src/components/scroll-area";
import { format } from "date-fns";
import { ChevronDown, CircleCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { discourse } = useUser();
  const { trigger_token, trigger_token_expires_at, installed_at } =
    discourse ?? {};

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isExpired =
    trigger_token_expires_at && trigger_token_expires_at < new Date();

  const onEnable = async () => {
    setLoading(true);
    router.push("/connect/discourse");
  };

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

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 py-16">
        <IntegrationHeader />
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Discourse />
          </div>
          <p className="font-medium text-lg">Discourse</p>
        </div>
        <Card>
          <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
            <div className="flex w-full items-center justify-between">
              <Link
                href="https://doc.useconquest.com/discourse"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-2 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Documentation</p>
              </Link>
              {(!trigger_token || isExpired) && (
                <Button onClick={onEnable} loading={loading} disabled={loading}>
                  <CircleCheck size={16} />
                  Enable
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="mb-0.5 p-0">
            <div className="p-4">
              <p className="font-medium text-base">Overview</p>
              <p className="text-balance text-muted-foreground">
                Connect your Discourse workspace to automatically sync messages,
                collect member interactions, and send personalized direct
                messages through automated workflows.
              </p>
            </div>
            {discourse?.status === "ENABLED" && !isExpired && <InstallForm />}
          </CardContent>
        </Card>
        {discourse?.status === "CONNECTED" && (
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
                  {installed_at && (
                    <p className="text-muted-foreground">
                      Installed on {format(installed_at, "PP")}
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
                      <p>Disconnect Discourse workspace</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )}
        <AlertDialog
          title="Disconnect Discourse workspace"
          description="Discourse integration will be removed from your workspace and all your data will be deleted."
          onConfirm={onDisconnect}
          open={open}
          setOpen={setOpen}
          buttonLabel="Disconnect"
        />
      </div>
    </ScrollArea>
  );
}
