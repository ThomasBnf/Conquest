import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import {
  ProfileAttributes,
  ProfileAttributesSchema,
} from "@conquest/zod/schemas/profile.schema";
import { addDays, endOfDay, subDays } from "date-fns";
import z from "zod";
import { listDays } from "../helpers/listDays";

export const totalMembers = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange, sources } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return {
        total: 0,
        growthRate: 0,
        weeks: [],
      };
    }

    const previousFrom = endOfDay(subDays(from, 1));

    type CountResult = { count: bigint };

    const [totalResult, previousTotalResult] = await Promise.all([
      prisma.$queryRaw<CountResult[]>`
        SELECT COUNT(*) as count
        FROM "Member"
        WHERE "workspaceId" = ${workspaceId}
        AND "createdAt" <= ${to}
      `,
      prisma.$queryRaw<CountResult[]>`
        SELECT COUNT(*) as count
        FROM "Member"
        WHERE "workspaceId" = ${workspaceId}
        AND "createdAt" <= ${previousFrom}
      `,
    ]);

    const total = totalResult[0]?.count ?? 0n;
    const previousTotal = previousTotalResult[0]?.count ?? 0n;

    const profilesQuery = `
      SELECT 
        p."memberId",
        p."attributes",
        p."createdAt"
      FROM "Profile" p
      WHERE p."workspaceId" = $1
      AND p."createdAt" <= $2
      AND p."attributes"->>'source' = ANY($3)
      AND p."id" IN (
        SELECT DISTINCT ON ("memberId") "id"
        FROM "Profile"
        WHERE "workspaceId" = $1
        AND "memberId" = p."memberId"
        ORDER BY "memberId", "createdAt" DESC
      )
    `;

    type ProfileData = {
      memberId: string;
      attributes: ProfileAttributes;
      createdAt: Date;
    };

    const profiles = await prisma.$queryRawUnsafe<ProfileData[]>(
      profilesQuery,
      workspaceId,
      to,
      sources,
    );

    const days: string[] = listDays(from, to);

    const dayEndTimes: Date[] = days.map((day: string, index: number) => {
      if (index === 0) {
        return endOfDay(new Date(from));
      }
      const currentDate = new Date(from);
      return endOfDay(addDays(currentDate, index));
    });

    const profilesBySource: Record<string, ProfileData[]> = profiles.reduce(
      (acc: Record<string, ProfileData[]>, profile: ProfileData) => {
        const attributes = ProfileAttributesSchema.parse(profile.attributes);
        const source: Source | undefined = attributes.source;

        if (source && sources.includes(source)) {
          acc[source] = acc[source] || [];
          acc[source].push(profile);
        }
        return acc;
      },
      {} as Record<string, ProfileData[]>,
    );

    for (const source of Object.keys(profilesBySource)) {
      profilesBySource[source]?.sort(
        (a: ProfileData, b: ProfileData) =>
          a.createdAt.getTime() - b.createdAt.getTime(),
      );
    }

    type ChartDataPoint = {
      day: string;
    } & Partial<Record<Source, number>>;

    const chartData: ChartDataPoint[] = days.map(
      (day: string, dayIndex: number) => {
        const dayData: Partial<Record<Source, number>> = {};
        const targetDate: Date = dayEndTimes[dayIndex]!;

        for (const source of sources) {
          const sourceProfiles: ProfileData[] = profilesBySource[source] || [];

          let count = 0;
          let left = 0;
          let right: number = sourceProfiles.length - 1;

          while (left <= right) {
            const mid: number = Math.floor((left + right) / 2);
            if (
              sourceProfiles[mid]?.createdAt &&
              sourceProfiles[mid].createdAt <= targetDate
            ) {
              count = mid + 1;
              left = mid + 1;
            } else {
              right = mid - 1;
            }
          }

          dayData[source] = count;
        }

        return {
          day,
          ...dayData,
        };
      },
    );

    const growthRate =
      previousTotal > 0
        ? Number(total - previousTotal) / Number(previousTotal)
        : 0;

    return {
      total,
      growthRate,
      days: chartData,
    };
  });
