"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";

type MergeResult = {
  members: [Member, Member];
  similarity: number;
};

const calculateSimilarity = (member1: Member, member2: Member): number => {
  // Normalize strings by removing spaces and special characters
  const normalizeString = (str: string) =>
    str?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";

  const name1 = normalizeString(
    `${member1.first_name ?? ""}${member1.last_name ?? ""}`,
  );
  const name2 = normalizeString(
    `${member2.first_name ?? ""}${member2.last_name ?? ""}`,
  );
  const email1 = normalizeString(member1.primary_email ?? "");
  const email2 = normalizeString(member2.primary_email ?? "");

  // Calculate scores only if strings are not empty
  const nameScore = name1 && name2 ? stringSimilarity(name1, name2) : 0;
  const emailScore = email1 && email2 ? stringSimilarity(email1, email2) : 0;

  // Adjust weights to be more lenient
  return nameScore * 0.5 + emailScore * 0.5;
};

const stringSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLength;

  return similarity;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from<number[]>({ length: m + 1 }).map(() =>
    Array<number>(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) {
    dp[i]![0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0]![j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] =
          1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }

  return dp[m]![n]!;
};

export const listMerges = authAction
  .metadata({
    name: "listMerges",
  })
  .action(async ({ ctx: { user } }) => {
    const workspace_id = user.workspace_id;

    const members = await prisma.members.findMany({
      where: {
        workspace_id,
      },
    });

    const parsedMembers = z.array(MemberSchema).parse(members);
    const potentialMerges: MergeResult[] = [];

    for (const member1 of parsedMembers) {
      const remainingMembers = parsedMembers.slice(
        parsedMembers.indexOf(member1) + 1,
      );

      for (const member2 of remainingMembers) {
        const similarity = calculateSimilarity(member1, member2);

        // Lower threshold to catch more potential matches
        if (similarity > 0.8) {
          potentialMerges.push({
            members: [member1, member2],
            similarity,
          });
        }
      }
    }

    return potentialMerges;
  });
