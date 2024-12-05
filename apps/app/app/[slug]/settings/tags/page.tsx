import { Tags } from "@/features/tags/tags";
import { listTags } from "@/queries/tags/listTags";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const user = await getCurrentUser();
  const workspace_id = user.workspace_id;

  const tags = await listTags({ workspace_id });

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-3xl flex-col py-24">
        <p className="font-medium text-2xl">Tags</p>
        <p className="text-muted-foreground">Manage community tags</p>
        <Separator className="my-4" />
        <Tags tags={tags} />
      </div>
    </ScrollArea>
  );
}
