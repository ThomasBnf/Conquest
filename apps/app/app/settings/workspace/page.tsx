import { DeleteWorkspace } from "@/features/workspaces/delete-workspace";
import { FormWorkspace } from "@/features/workspaces/form-workspace";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Workspace</p>
        <p className="text-muted-foreground">
          Change the settings for your current workspace
        </p>
        <Separator className="my-4" />
        <div className="space-y-4">
          <FormWorkspace />
          <DeleteWorkspace />
        </div>
      </div>
    </ScrollArea>
  );
}
