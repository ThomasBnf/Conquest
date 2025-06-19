import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: Member;
  groupFilters: GroupFilters;
};

export const getFilteredMember = async ({ member, groupFilters }: Props) => {
  const { operator } = groupFilters;

  // const filterBy = getFilters({ groupFilters });
  // const filtersStr = filterBy.join(operator === "OR" ? " OR " : " AND ");

  // const result = await client.query({
  //   query: `
  //     SELECT
  //       if(${filtersStr || "1"}, 1, 0) as result
  //     FROM member m FINAL
  //     LEFT JOIN level l ON m.levelId = l.id
  //     LEFT JOIN company c ON m.companyId = c.id
  //     LEFT JOIN (
  //       SELECT
  //         memberId,
  //         groupArray(attributes) as attributes
  //       FROM profile FINAL
  //       GROUP BY memberId
  //     ) p ON m.id = p.memberId
  //     WHERE m.id = '${member.id}'
  //   `,
  // });

  // const { data } = (await result.json()) as { data: { result: number }[] };
  // return data[0]?.result;
};
