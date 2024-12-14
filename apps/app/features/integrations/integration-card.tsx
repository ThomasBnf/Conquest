import { buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";

type Props = {
  integration: Integration | undefined;
  doc_url: string;
  install_button: React.ReactNode;
  uninstall_button: React.ReactNode;
};

export const IntegrationCard = ({
  integration,
  doc_url,
  children,
  install_button,
  uninstall_button,
}: PropsWithChildren<Props>) => {
  return (
    <Card>
      <CardHeader className="flex h-14 flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <Link
            href={doc_url}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "link", size: "xs" }),
              "flex w-fit items-center gap-2 text-foreground",
            )}
          >
            <ExternalLink size={15} />
            <p>Documentation</p>
          </Link>
        </div>
        {!integration?.id && install_button}
        {integration?.status === "INSTALLED" && uninstall_button}
      </CardHeader>
      <CardContent className="mb-0.5 p-0">
        <div className="p-4">
          <p className="font-medium text-base">Overview</p>
          <p className="text-balance text-muted-foreground">
            Connect your Slack workspace to automatically sync messages, collect
            member interactions, and send personalized direct messages through
            automated workflows.
          </p>
        </div>
        <div className={cn("px-4", children ? "pb-4" : "")}>{children}</div>
      </CardContent>
    </Card>
  );
};
