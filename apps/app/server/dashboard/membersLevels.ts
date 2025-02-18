import { prisma } from "@conquest/db/prisma";
import { listLevels } from "@conquest/db/queries/levels/listLevels";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { endOfWeek, isWithinInterval, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const membersLevels = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    const levels = await listLevels({ workspace_id });
    const members = await prisma.member.findMany({
      where: { workspace_id },
    });

    const parsedMembers = MemberSchema.array().parse(members);

    // Dates pour la semaine actuelle
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { locale: fr, weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { locale: fr, weekStartsOn: 1 });

    const levelsCount = levels.map((level) => {
      // Calcul du max historique par semaine
      const weeklyMemberCounts = new Map<string, number>();

      for (const member of parsedMembers) {
        const memberLogs = member.logs.filter(
          (log) =>
            log.levelId === level.id &&
            new Date(log.date) >= from &&
            new Date(log.date) <= to,
        );

        for (const log of memberLogs) {
          const logDate = new Date(log.date);
          const weekStart = startOfWeek(logDate, {
            locale: fr,
            weekStartsOn: 1,
          });
          const weekKey = weekStart.toISOString();

          weeklyMemberCounts.set(
            weekKey,
            (weeklyMemberCounts.get(weekKey) || 0) + 1,
          );
        }
      }

      const maxWeekCount = Math.max(
        ...Array.from(weeklyMemberCounts.values()),
        0,
      );
      const maxWeek = Array.from(weeklyMemberCounts.entries()).find(
        ([_, count]) => count === maxWeekCount,
      );

      // Calcul du nombre actuel de membres pour ce niveau
      const currentMembersCount = parsedMembers.filter((member) => {
        const latestLog = member.logs
          .filter((log) =>
            isWithinInterval(new Date(log.date), {
              start: currentWeekStart,
              end: now,
            }),
          )
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0];

        return latestLog?.levelId === level.id;
      }).length;

      return {
        name: `${level.number} • ${level.name}`,
        maxMembers: maxWeekCount,
        maxWeekDate: maxWeek ? maxWeek[0] : null,
        currentMembers: currentMembersCount,
        currentWeekStart: currentWeekStart.toISOString(),
        currentWeekEnd: currentWeekEnd.toISOString(),
      };
    });

    return levelsCount;
  });
