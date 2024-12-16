import { FormUser } from "@/features/users/form-user";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { Separator } from "@conquest/ui/separator";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
      <p className="font-medium text-2xl">Profile</p>
      <p className="text-muted-foreground">Manage your Conquest profile</p>
      <Separator className="my-4" />
      <FormUser user={user} />
    </div>
  );
}
