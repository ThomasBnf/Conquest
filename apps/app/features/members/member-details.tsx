import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: Member;
};

export const MemberDetails = ({ member }: Props) => {
  const { first_name, last_name, primary_email, avatar_url } = member;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={avatar_url ?? ""} />
        <AvatarFallback className="text-sm">
          {first_name?.charAt(0).toUpperCase()}
          {last_name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col">
        <p>
          {first_name} {last_name}
        </p>
        <span className="text-muted-foreground text-xs">{primary_email}</span>
      </div>
    </div>
  );
};
