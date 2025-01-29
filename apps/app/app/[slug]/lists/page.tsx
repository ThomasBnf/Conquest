import { getCurrentUser } from "@/queries/getCurrentUser";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  const { slug } = user.workspace;

  redirect(`/${slug}`);
}
