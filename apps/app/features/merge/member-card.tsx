import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { cn } from "@conquest/ui/cn";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { useMemo } from "react";
import { FilteredEntries } from "./filtered-entries";

type Props = {
  member: MemberWithCompany | null;
  leftMember?: MemberWithCompany | null;
  className?: string;
};

export const MemberCard = ({ member, leftMember, className }: Props) => {
  if (!member) return null;

  const { first_name, last_name, avatar_url } = member;

  const getMergeValue = useMemo(() => {
    return (member: MemberWithCompany, leftMember: MemberWithCompany) => {
      const isLeftOlder =
        leftMember.first_activity &&
        member.first_activity &&
        leftMember.first_activity < member.first_activity;

      const mergedEntries = Object.entries(leftMember).map(([key, value]) => {
        const rightValue = member[key as keyof MemberWithCompany];

        if (!value) {
          return [key, rightValue];
        }

        if (value && !rightValue) {
          return [key, value];
        }

        if (key === "source") {
          return [key, isLeftOlder ? value : rightValue];
        }

        if (key === "first_activity") {
          return [key, isLeftOlder ? value : rightValue];
        }

        return [key, rightValue];
      });

      return {
        ...member,
        ...Object.fromEntries(mergedEntries),
      };
    };
  }, []);

  return (
    <div
      className={cn(
        "flex aspect-square w-[calc(50%-24px)] flex-col divide-y rounded-md border",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Avatar className="size-9">
          <AvatarImage src={avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {first_name?.charAt(0).toUpperCase()}
            {last_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p>
          {first_name} {last_name}
        </p>
        <FilteredEntries
          member={leftMember ? getMergeValue(member, leftMember) : member}
        />
      </div>
    </div>
  );
};
