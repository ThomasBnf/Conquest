import { listTags } from "@/features/tags/functions/listTags";
import { Tags } from "@/features/tags/tags";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const rTags = await listTags();
  const tags = rTags?.data;

  return (
    <div className="mx-auto flex max-w-3xl flex-col py-24">
      <p className="text-2xl font-medium">Tags</p>
      <p className="text-muted-foreground">Manage community tags</p>
      <Separator className="my-4" />
      <Tags tags={tags} />
    </div>
  );
}
