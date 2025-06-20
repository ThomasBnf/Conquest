"use client";

import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { PropsWithChildren } from "react";
import { ButtonBillingPortal } from "./button-billing-portal";

type Props = {
  title: string;
  description: string;
  displayTrial?: boolean;
};

export const BillingPage = ({
  title,
  description,
  displayTrial = true,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-12 lg:px-12">
        <div className="flex items-end justify-between">
          <div className="">
            <p className="font-medium text-2xl">{title}</p>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {!displayTrial && <ButtonBillingPortal />}
        </div>
        <Separator className="my-4" />
        <div className="space-y-10">
          {displayTrial && (
            <div className="rounded-md border bg-sidebar p-4 shadow-sm">
              <p className="font-medium">⚠️ Trial ended</p>
              <p className="text-muted-foreground">
                Your trial has ended. Please select a plan
              </p>
            </div>
          )}
          {children}
        </div>
      </div>
    </ScrollArea>
  );
};
