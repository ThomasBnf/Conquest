import { UserProvider } from "@/context/userContext";
import { SlackInstaller } from "@/features/integrations/slack-installer";
import { getCurrentUser } from "@/helpers/getCurrentUser";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <UserProvider user={user}>
      <SlackInstaller />
    </UserProvider>
  );
}
