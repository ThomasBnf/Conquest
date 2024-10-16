import { getCurrentUser } from "@/actions/users/getCurrentUser";
import { UserProvider } from "@/context/userContext";
import { SlackInstaller } from "@/features/integrations/slack-installer";

export default async function Page() {
  const rUser = await getCurrentUser();
  const user = rUser?.data;

  return (
    <UserProvider user={user}>
      <SlackInstaller />
    </UserProvider>
  );
}
