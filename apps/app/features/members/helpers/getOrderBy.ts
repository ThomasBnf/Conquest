import type { Prisma } from "@conquest/database";

export const getOrderBy = (
  id: string,
  desc: boolean,
): Prisma.membersOrderByWithRelationInput => {
  if (!id) {
    return { last_name: desc ? "desc" : "asc" };
  }

  if (id === "activities") {
    return { activities: { _count: desc ? "desc" : "asc" } };
  }

  if (id === "last_activity" || id === "created_at") {
    return {};
  }

  return { [id]: desc ? "desc" : "asc" };
};
