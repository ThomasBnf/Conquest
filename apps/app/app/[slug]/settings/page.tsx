import { FormUser } from "@/features/users/form-user";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { Separator } from "@conquest/ui/src/components/separator";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-col py-24">
      <p className="font-medium text-2xl">Profile</p>
      <p className="text-muted-foreground">Manage your Conquest profile</p>
      <Separator className="my-4" />
      <FormUser user={user} />
    </div>
  );
}
