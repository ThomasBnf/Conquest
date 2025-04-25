import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import type { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: Member;
};

export const MemberDetails = ({ member }: Props) => {
  const { firstName, lastName, primaryEmail, avatarUrl } = member;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={avatarUrl ?? ""} />
        <AvatarFallback className="text-sm">
          {firstName?.charAt(0).toUpperCase()}
          {lastName?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col">
        <p>
          {firstName} {lastName}
        </p>
        <span className="text-muted-foreground text-xs">{primaryEmail}</span>
      </div>
    </div>
  );
};
