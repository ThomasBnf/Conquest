import { Hono } from "hono";

export const webhook = new Hono().post("/livestorm", async (c) => {
  console.log(await c.req.json());
  return c.json(200);
  // const { data } = await c.req.json();
  // const { organization_id } = data.meta.webhook;

  // const integration = await prisma.integrations.findFirst({
  //   where: {
  //     details: {
  //       path: ["organization_id"],
  //       equals: organization_id,
  //     },
  //   },
  // });

  // if (!integration) return c.json(200);

  // const livestorm = LivestormIntegrationSchema.parse(integration);
  // const { workspace_id, details } = livestorm;
  // const { access_token } = details;

  // const session = data as Session;
  // const { attributes } = session;
  // const { name, event_id, estimated_started_at, ended_at } = attributes;

  // const event = await getEvent({ accessToken: access_token, id: event_id });
  // const { title } = event.attributes;

  // if (session.attributes.status === "past") {
  //   const peoples = await listPeopleFromSession({
  //     accessToken: access_token,
  //     id: session.id,
  //   });

  //   for (const people of peoples) {
  //     const { id, attributes } = people;
  //     const {
  //       email,
  //       first_name,
  //       last_name,
  //       avatar_link,
  //       registrant_detail,
  //       role,
  //       created_at,
  //     } = attributes;
  //     const { ip_country_code, attended, is_guest_speaker } = registrant_detail;

  //     if (role === "team_member") continue;

  //     const locale = getLocaleByAlpha2(ip_country_code) ?? null;

  //     const createdMember = await upsertMember({
  //       id,
  //       data: {
  //         first_name,
  //         last_name,
  //         primary_email: email,
  //         avatar_url: avatar_link,
  //         locale,
  //         source: "LIVESTORM",
  //         workspace_id,
  //       },
  //     });

  //     if (is_guest_speaker) {
  //       await prisma.activities.deleteMany({
  //         where: {
  //           activity_type: {
  //             key: "livestorm:register",
  //           },
  //           member_id: createdMember.id,
  //           event_id: event.id,
  //         },
  //       });

  //       await createActivity({
  //         external_id: null,
  //         activity_type_key: "livestorm:co-host",
  //         message: `Co-hosted the Livestorm event: ${title}`,
  //         member_id: createdMember.id,
  //         event_id: event.id,
  //         created_at: new Date(created_at * 1000),
  //         workspace_id,
  //       });
  //     }

  //     if (attended) {
  //       await createActivity({
  //         external_id: null,
  //         activity_type_key: "livestorm:attend",
  //         message: `Attended the Livestorm event: ${title}`,
  //         member_id: createdMember.id,
  //         event_id: event.id,
  //         created_at: new Date(ended_at * 1000),
  //         workspace_id,
  //       });
  //     }
  //   }

  //   return c.json({ success: true });
  // }

  // await prisma.events.create({
  //   data: {
  //     external_id: session.id,
  //     source: "LIVESTORM",
  //     title: name ? `${title} - ${name}` : title,
  //     started_at: new Date(estimated_started_at * 1000),
  //     ended_at: new Date(ended_at * 1000),
  //     workspace_id,
  //   },
  // });

  // return c.json({ success: true });
});
