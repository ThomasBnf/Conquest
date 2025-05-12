import { client } from "../client";
import {
  getMembersToRemoveAtRiskTag,
  getMembersWithoutAtRiskTag,
} from "./atRiskMembers";

const AT_RISK_TAG_ID = "at-risk"; // À remplacer par l'ID réel du tag

export const addAtRiskTagToMembers = async () => {
  const membersWithoutTag = await getMembersWithoutAtRiskTag();

  if (membersWithoutTag.length === 0) return;

  const memberIds = membersWithoutTag.map((m) => m.id);
  const values = memberIds
    .map((id) => `('${id}', '${AT_RISK_TAG_ID}')`)
    .join(",");

  await client.query({
    query: `
      INSERT INTO member_tag (memberId, tagId)
      VALUES ${values}
    `,
  });
};

export const removeAtRiskTagFromMembers = async () => {
  const membersToRemoveTag = await getMembersToRemoveAtRiskTag();

  if (membersToRemoveTag.length === 0) return;

  const memberIds = membersToRemoveTag.map((m) => m.id);
  const memberIdsList = memberIds.map((id) => `'${id}'`).join(",");

  await client.query({
    query: `
      DELETE FROM member_tag
      WHERE 
        memberId IN (${memberIdsList})
        AND tagId = '${AT_RISK_TAG_ID}'
    `,
  });
};
