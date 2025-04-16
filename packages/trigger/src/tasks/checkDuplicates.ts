import { client } from "@conquest/clickhouse/client";
import { listAllDuplicates } from "@conquest/db/duplicates/listAllDuplicates";
import { REASON, prisma } from "@conquest/db/prisma";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";

export const checkDuplicates = schemaTask({
  id: "check-duplicates",
  run: async () => {
    const workspaces = await listWorkspaces();

    for (const workspace of workspaces) {
      const { id: workspace_id } = workspace;

      logger.info(workspace_id);

      const result = await client.query({
        query: `
          SELECT
            'EMAIL' AS reason,
            m.primary_email AS value,
            groupArray(m.id) AS member_ids
          FROM member m FINAL
          WHERE m.primary_email != '' AND m.primary_email IS NOT NULL AND length(trim(m.primary_email)) > 0 AND m.workspace_id = '${workspace_id}'
          GROUP BY m.primary_email
          HAVING count() > 1
          
          UNION ALL
          
          SELECT
            'NAME' AS reason,
            concat(m.first_name, ' ', m.last_name) AS value,
            groupArray(m.id) AS member_ids
          FROM member m FINAL
          WHERE m.first_name != '' AND m.last_name != '' AND m.workspace_id = '${workspace_id}'
          GROUP BY m.first_name, m.last_name
          HAVING count() > 1

          UNION ALL

          SELECT
            'USERNAME' AS reason,
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
          reason: REASON;
          value: string;
          member_ids: string[];
        }[];
      };

      console.log(data);

      const duplicates = await listAllDuplicates({ workspace_id });

      logger.info("duplicates", { duplicates });

      for (const item of data) {
        const { member_ids, reason } = item;

        const duplicate = duplicates.find((duplicate) => {
          const sortedExisting = [...duplicate.member_ids].sort();
          const sortedNew = [...member_ids].sort();
          return JSON.stringify(sortedExisting) === JSON.stringify(sortedNew);
        });

        const memberIds = member_ids.map((id) => `'${id}'`).join(",");

        console.log(memberIds);

        const result = await client.query({
          query: `
            SELECT sum(pulse) 
            FROM member FINAL
            WHERE id IN (${memberIds})
          `,
        });

        const { data: pulse } = (await result.json()) as {
          data: {
            "sum(pulse)": string;
          }[];
        };

        const total_pulse = pulse[0] ? Number(pulse[0]["sum(pulse)"]) : 0;

        console.log(total_pulse);

        if (duplicate) {
          if (total_pulse === duplicate.total_pulse) continue;

          await prisma.duplicate.update({
            where: {
              id: duplicate.id,
            },
            data: {
              total_pulse,
            },
          });
        } else {
          await prisma.duplicate.create({
            data: {
              total_pulse,
              member_ids,
              reason,
              state: "PENDING",
              workspace_id,
            },
          });
        }
      }
    }
  },
});
