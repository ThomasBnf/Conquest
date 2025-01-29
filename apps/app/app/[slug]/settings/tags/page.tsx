import { Tags } from "@/features/tags/tags";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { listTags } from "@conquest/db/queries/tags/listTags";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const user = await getCurrentUser();
  const { workspace_id } = user;

  const tags = await listTags({ workspace_id });

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Tags</p>
        <p className="text-muted-foreground">Manage community tags</p>
        <Separator className="my-4" />
        <Tags tags={tags} />
      </div>
    </ScrollArea>
  );
}
