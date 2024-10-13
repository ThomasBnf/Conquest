import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import Link from "next/link";
import type { ActivityWithContact } from "schemas/activity.schema";

type Props = {
  activity: ActivityWithContact;
};

export const AvatarActivity = async ({ activity }: Props) => {
  const { avatar_url, first_name, full_name } = activity.contact ?? {};

  return (
    <Link
      href=""
      // href={`/${user?.workspace.slug}/contacts/${contact?.id}?from=activities`}
      className="group flex cursor-pointer items-center gap-2"
    >
      <Avatar className="size-8">
        <AvatarImage src={avatar_url ?? ""} />
        <AvatarFallback className="text-sm">
          {first_name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <p className="text-sm font-medium group-hover:underline">{full_name}</p>
    </Link>
  );
};
