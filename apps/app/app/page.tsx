import { getCurrentUser } from "@/helpers/getCurrentUser";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user.onboarding) redirect("/");
  redirect(`/${user?.workspace.slug}`);
}
