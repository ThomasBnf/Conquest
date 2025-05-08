import { client } from "@conquest/clickhouse/client";
import { listAllDuplicates } from "@conquest/db/duplicates/listAllDuplicates";
import { REASON, prisma } from "@conquest/db/prisma";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import { Reason } from "@conquest/zod/enum/reason.enum";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";

export const checkDuplicates = schemaTask({
  id: "check-duplicates",
  run: async () => {
    const workspaces = await listWorkspaces();

    for (const workspace of workspaces) {
      const { id: workspaceId } = workspace;

      logger.info(workspaceId);

      const result = await client.query({
        query: `
          SELECT
            'EMAIL' AS reason,
            m.primaryEmail AS value,
            groupArray(m.id) AS memberIds
          FROM member m FINAL
          WHERE 
            m.primaryEmail != '' 
            AND m.primaryEmail IS NOT NULL 
            AND length(trim(m.primaryEmail)) > 0 
            AND m.workspaceId = '${workspaceId}'
          GROUP BY m.primaryEmail
          HAVING count(DISTINCT m.id) > 1
          AND max(m.pulse) > 0
          
          UNION ALL
          
          SELECT
            'NAME' AS reason,
            concat(m.firstName, ' ', m.lastName) AS value,
            groupArray(m.id) AS memberIds
          FROM member m FINAL
          WHERE 
            m.firstName != ''
            AND m.lastName != ''
            AND m.workspaceId = '${workspaceId}'
          GROUP BY m.firstName, m.lastName
          HAVING count(DISTINCT m.id) > 1
          AND max(m.pulse) > 0

          UNION ALL

          SELECT
            'USERNAME' AS reason,
            username AS value,
            groupArray(memberId) AS memberIds
          FROM (
              SELECT 
                  JSONExtractString(toString(p.attributes), 'username') AS username,
                  p.memberId,
                  m.pulse
              FROM profile p FINAL
              LEFT JOIN member m FINAL ON m.id = p.memberId
              WHERE JSONExtractString(toString(p.attributes), 'source') = 'Discord' 
              AND JSONExtractString(toString(p.attributes), 'username') != ''
              AND p.workspaceId = '${workspaceId}'

              UNION ALL

              SELECT 
                  JSONExtractString(toString(p.attributes), 'username') AS username,
                  p.memberId,
                  m.pulse
              FROM profile p FINAL
              LEFT JOIN member m FINAL ON m.id = p.memberId
              WHERE JSONExtractString(toString(p.attributes), 'source') = 'Discourse'
              AND JSONExtractString(toString(p.attributes), 'username') != ''
              AND p.workspaceId = '${workspaceId}'

              UNION ALL

              SELECT 
                  JSONExtractString(toString(p.attributes), 'login') AS username,
                  p.memberId,
                  m.pulse
              FROM profile p FINAL
              LEFT JOIN member m FINAL ON m.id = p.memberId
              WHERE JSONExtractString(toString(p.attributes), 'source') = 'Github'
              AND JSONExtractString(toString(p.attributes), 'login') != ''
              AND p.workspaceId = '${workspaceId}'
          ) t
          GROUP BY username
          HAVING count(DISTINCT memberId) > 1
            AND max(pulse) > 0
        `,
        format: "JSON",
      });

      const { data } = (await result.json()) as {
        data: {
          reason: Reason;
          value: string;
          memberIds: string[];
        }[];
      };

      const duplicates = await listAllDuplicates({ workspaceId });

      logger.info("duplicates", { duplicates });

      for (const item of data) {
        const { memberIds, reason } = item;

        const duplicate = duplicates.find((duplicate) => {
          const sortedExisting = [...duplicate.memberIds].sort();
          const sortedNew = [...memberIds].sort();
          return JSON.stringify(sortedExisting) === JSON.stringify(sortedNew);
        });

        const result = await client.query({
          query: `
            SELECT sum(pulse) 
            FROM member FINAL
            WHERE id IN (${memberIds.map((id) => `'${id}'`).join(",")})
          `,
        });

        const { data: pulse } = (await result.json()) as {
          data: {
            "sum(pulse)": string;
          }[];
        };

        const totalPulse = pulse[0] ? Number(pulse[0]["sum(pulse)"]) : 0;

        if (duplicate) {
          if (totalPulse === duplicate.totalPulse) continue;

          await prisma.duplicate.update({
            where: {
              id: duplicate.id,
            },
            data: {
              totalPulse,
            },
          });
        } else {
          await prisma.duplicate.create({
            data: {
              totalPulse,
              memberIds,
              reason: reason as REASON,
              state: "PENDING",
              workspaceId,
            },
          });
        }
      }
    }
  },
});
