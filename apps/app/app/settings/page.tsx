import { DeleteAccountCard } from "@/features/users/delete-account-card";
import { FormUser } from "@/features/users/form-user";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";

export default function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Profile</p>
        <p className="text-muted-foreground">Manage your Conquest profile</p>
        <Separator className="my-4" />
        <div className="space-y-4">
          <FormUser />
          <DeleteAccountCard />
        </div>
      </div>
    </ScrollArea>
  );
}
