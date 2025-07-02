"use client";

import { useWorkspace } from "@/hooks/useWorkspace";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { PropsWithChildren } from "react";
import { ButtonBillingPortal } from "./button-billing-portal";

type Props = {
  title: string;
  description: string;
};

export const BillingPage = ({
  title,
  description,
  children,
}: PropsWithChildren<Props>) => {
  const { workspace } = useWorkspace();
  const { priceId, trialEnd, plan } = workspace ?? {};

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 lg:px-12">
        <div>
          <p className="font-medium text-2xl">{title}</p>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Separator />
        {priceId && (
          <div className="flex items-center justify-between gap-2 rounded-md border bg-sidebar p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <p>You are currently on plan </p>
              <Badge variant="info">{plan}</Badge>
            </div>
            <ButtonBillingPortal />
          </div>
        )}
        <div className="space-y-10">
          {trialEnd && (
            <div className="rounded-md border bg-sidebar p-4 shadow-sm">
              <p className="font-medium">⚠️ Trial ended</p>
              <p className="text-muted-foreground">
                Your trial has ended. Please select a plan to continue using the
                Conquest.
              </p>
            </div>
          )}
          {children}
        </div>
      </div>
    </ScrollArea>
  );
};
