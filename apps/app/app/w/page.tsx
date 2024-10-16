import { getCurrentUser } from "@/actions/users/getCurrentUser";
import { redirect } from "next/navigation";

export default async function Page() {
  const rUser = await getCurrentUser();
  const user = rUser?.data;

  if (!user?.onboarding) redirect("/");
  redirect(`/w/${user?.workspace.slug}`);
}
