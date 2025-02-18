import { LevelsList } from "@/features/levels/levels-list";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Member Level</p>
        <p className="text-muted-foreground">
          Create and manage community levels based on member Pulse Score, set
          thresholds for progression
        </p>
        <Link
          href="https://docs.useconquest.com/levels"
          className={cn(
            buttonVariants({ variant: "link" }),
            "mt-1.5 h-fit w-fit p-0",
          )}
        >
          Documentation
          <ExternalLink size={14} className="ml-1.5 text-muted-foreground" />
        </Link>
        <Separator className="my-4" />
        <LevelsList />
      </div>
    </ScrollArea>
  );
}
