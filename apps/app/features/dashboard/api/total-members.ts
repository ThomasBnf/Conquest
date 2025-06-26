import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { addDays, endOfDay, format, subDays } from "date-fns";
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
        days: [],
      };
    }

    const previousFrom = endOfDay(subDays(from, 1));
    const days = listDays(from, to);

    // Optimisation 1: Utiliser des requêtes SQL brutes pour les comptages
    const [total, previousTotal] = await Promise.all([
      prisma.member.count({
        where: {
          workspaceId,
          createdAt: {
            lte: to,
          },
        },
      }),
      prisma.member.count({
        where: {
          workspaceId,
          createdAt: {
            lte: previousFrom,
          },
        },
      }),
    ]);

    // Optimisation 2: Obtenir les données agrégées directement depuis la base de données
    // au lieu de les traiter en mémoire
    const sourceCounts = await Promise.all(
      sources.map(async (source) => {
        // Pour chaque jour, obtenir le nombre cumulatif de profils par source
        const dailyCounts = await Promise.all(
          days.map(async (day, index) => {
            const dayDate =
              index === 0
                ? endOfDay(new Date(from))
                : endOfDay(addDays(new Date(from), index));

            // Compter les profils pour cette source jusqu'à ce jour
            const count = (await prisma.$queryRaw`
              SELECT COUNT(DISTINCT "memberId") 
              FROM "Profile" 
              WHERE "workspaceId" = ${workspaceId}
              AND "createdAt" <= ${dayDate}
              AND "attributes"->>'source' = ${source}
            `) as unknown as { count: number }[];

            return {
              day,
              count: Number(count[0]?.count),
            };
          }),
        );

        return {
          source,
          dailyCounts,
        };
      }),
    );

    // Transformer les données pour le format attendu par le frontend
    const chartData = days.map((day) => {
      const dayData: Partial<Record<Source, number>> = {};

      for (const sourceData of sourceCounts) {
        const dayCount = sourceData.dailyCounts.find((d) => d.day === day);
        if (dayCount) {
          dayData[sourceData.source as Source] = dayCount.count;
        }
      }

      return {
        day,
        ...dayData,
      };
    });

    const growthRate =
      previousTotal > 0 ? (total - previousTotal) / previousTotal : 0;

    return {
      total,
      growthRate,
      days: chartData,
    };
  });
