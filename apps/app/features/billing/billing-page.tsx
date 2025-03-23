"use client";

import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { PropsWithChildren } from "react";

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
        <p className="font-medium text-2xl">{title}</p>
        <p className="text-muted-foreground">{description}</p>
        <Separator className="my-4" />
        <div className="space-y-10">
          {displayTrial && (
            <div className="rounded-md border bg-sidebar p-4 shadow-sm">
              <p className="font-medium">⚠️ Trial ended</p>
              <p className="text-muted-foreground">
                Your trial has ended. Please select a plan according to your
                needs.
              </p>
            </div>
          )}
          {children}
        </div>
      </div>
    </ScrollArea>
  );
};
