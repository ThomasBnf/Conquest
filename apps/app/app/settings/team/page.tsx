import { HeaderTeam } from "@/features/team/header-team";
import { TableTeam } from "@/features/team/table-team";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Team</p>
        <p className="text-muted-foreground">Manage your team members</p>
        <Separator className="my-4" />
        <HeaderTeam />
        <TableTeam />
      </div>
    </ScrollArea>
  );
}
