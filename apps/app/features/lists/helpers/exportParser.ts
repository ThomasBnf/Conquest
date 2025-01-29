import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";

export const exportParser = (member: MemberWithCompany) => {
  const transformed: Record<string, string> = {};

  const safeStringify = (value: unknown): string => {
    if (!value) return "";

    if (Array.isArray(value)) {
      return value.map((item) => safeStringify(item)).join(", ");
    }

    if (typeof value === "object") return JSON.stringify(value);

    return String(value);
  };

  for (const [key, value] of Object.entries(member)) {
    if (key === "company") continue;
    if (key === "logs") continue;

    if (key === "custom_fields" && typeof value === "object") {
      transformed[key] = safeStringify(value);
    }

    if (key === "tags" && Array.isArray(value)) {
      transformed[key] = value.join(", ");
    }

    transformed[key] = safeStringify(value);
  }

  return transformed;
};
