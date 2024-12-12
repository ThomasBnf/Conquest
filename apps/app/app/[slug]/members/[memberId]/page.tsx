import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";

type Props = {
  params: {
    memberId: string;
  };
};

export default async function Page({ params: { memberId } }: Props) {
  const user = await getCurrentUser();
  const slug = user.workspace.slug;

  return redirect(`/${slug}/members/${memberId}/activities`);
}
