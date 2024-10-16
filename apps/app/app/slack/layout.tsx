import { getCurrentUser } from "actions/users/getCurrentUser";
import { UserProvider } from "context/userContext";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const rUser = await getCurrentUser();
  const user = rUser?.data;

  return <UserProvider user={user}>{children}</UserProvider>;
}
