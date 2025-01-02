import type { MemberWithActivities } from "@conquest/zod/schemas/activity.schema";

export const sortByCreatedAt = (
  a: MemberWithActivities,
  b: MemberWithActivities,
) => {
  const joinedAtA = a.created_at?.getTime() ?? 0;
  const joinedAtB = b.created_at?.getTime() ?? 0;
  return joinedAtB - joinedAtA;
};
