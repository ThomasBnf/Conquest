import { client } from "@conquest/clickhouse/client";
import { REASON, prisma } from "@conquest/db/prisma";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";

export const checkDuplicates = schemaTask({
  id: "check-duplicates",
  run: async () => {
    const workspaces = await listWorkspaces();

    for (const workspace of workspaces) {
      const { id: workspace_id } = workspace;

      const result = await client.query({
        query: `
          SELECT
            'EMAIL' AS duplicate_type,
            m.primary_email AS value,
            groupArray(m.id) AS member_ids
          FROM member m FINAL
          WHERE m.primary_email != '' AND m.workspace_id = '${workspace_id}'
          GROUP BY m.primary_email
          HAVING count() > 1
          
          UNION ALL
          
          SELECT
            'NAME' AS duplicate_type,
            concat(m.first_name, ' ', m.last_name) AS value,
            groupArray(m.id) AS member_ids
          FROM member m FINAL
          WHERE m.first_name != '' AND m.last_name != '' AND m.workspace_id = '${workspace_id}'
          GROUP BY m.first_name, m.last_name
          HAVING count() > 1

          UNION ALL

          SELECT
            'USERNAME' AS duplicate_type,
            username AS value,
            groupArray(member_id) AS member_ids
          FROM (
              SELECT 
                  JSONExtractString(toString(p.attributes), 'username') AS username,
                  p.member_id
              FROM profile p FINAL
              WHERE JSONExtractString(toString(p.attributes), 'source') = 'Discord' 
              AND JSONExtractString(toString(p.attributes), 'username') != ''
              AND p.workspace_id = '${workspace_id}'

              UNION ALL

              SELECT 
                  JSONExtractString(toString(p.attributes), 'username') AS username,
                  p.member_id
              FROM profile p FINAL
              WHERE JSONExtractString(toString(p.attributes), 'source') = 'Discourse'
              AND JSONExtractString(toString(p.attributes), 'username') != ''
              AND p.workspace_id = '${workspace_id}'

              UNION ALL

              SELECT 
                  JSONExtractString(toString(p.attributes), 'login') AS username,
                  p.member_id
              FROM profile p FINAL
              WHERE JSONExtractString(toString(p.attributes), 'source') = 'Github'
              AND JSONExtractString(toString(p.attributes), 'login') != ''
              AND p.workspace_id = '${workspace_id}'
          )
          GROUP BY username
          HAVING count() > 1
        `,
        format: "JSON",
      });

      const { data } = (await result.json()) as {
        data: {
          duplicate_type: string;
          value: string;
          member_ids: string[];
        }[];
      };

      logger.info("data", { data });

      const currentDuplicates = await prisma.duplicate.findMany({
        where: {
          workspace_id,
        },
      });

      logger.info("currentDuplicates", { currentDuplicates });

      const filteredDuplicates = data.filter(
        (duplicate) =>
          !currentDuplicates.some((currentDuplicate) =>
            currentDuplicate.member_ids.some((id) =>
              duplicate.member_ids.includes(id),
            ),
          ),
      );

      logger.info("filteredDuplicates", { filteredDuplicates });

      if (filteredDuplicates.length > 0) {
        await prisma.duplicate.createMany({
          data: filteredDuplicates.map((duplicate) => ({
            member_ids: duplicate.member_ids,
            reason: duplicate.duplicate_type as REASON,
            state: "PENDING",
            workspace_id,
          })),
        });
      }

      await prisma.workspace.update({
        where: { id: workspace_id },
        data: {
          last_duplicates_checked_at: new Date(),
        },
      });
    }
  },
});
