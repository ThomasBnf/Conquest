import { listTags } from "@/features/tags/actions/listTags";
import { Tags } from "@/features/tags/tags";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const rTags = await listTags();
  const tags = rTags?.data;

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
