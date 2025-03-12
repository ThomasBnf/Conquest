import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { data } = await request.json();
  const { id, attributes, meta } = data;
  const { event, organization_id } = meta.webhook;

  // console.dir(data, { depth: 100 });

  // const integration = await getIntegration({
  //   external_id: organization_id,
  //   status: "CONNECTED",
  // });

  // if (!integration) return c.json(200);

  // const livestorm = LivestormIntegrationSchema.parse(integration);
  // const { workspace_id, details } = livestorm;
  // const { filter } = details;

  // const access_token = await getRefreshToken(livestorm);

  if (event === "session.created") {
    //   const parsedAttributes = SessionWebhookSchema.parse(attributes);
    //   const { event_id } = parsedAttributes;
    //   const event = await getEvent({ accessToken: access_token, id: event_id });
    //   const { title } = event.attributes;
    //   if (filter && !title.includes(filter)) {
    //     return c.json(200);
    //   }
    //   let sessionPage = 0;
    //   const allSessions: Session[] = [];
    //   while (true) {
    //     const listOfSessions = await listEventSessions({
    //       access_token,
    //       event_id,
    //       page: sessionPage,
    //     });
    //     if (!listOfSessions?.length) break;
    //     allSessions.push(...listOfSessions);
    //     sessionPage++;
    //     if (listOfSessions.length < 100) break;
    //   }
    //   for (const session of allSessions) {
    //     const { attributes } = session;
    //     const { name, estimated_started_at, ended_at } = attributes;
    //     await prisma.events.create({
    //       data: {
    //         external_id: session.id,
    //         source: "LIVESTORM",
    //         title: name ? `${title} - ${name}` : title,
    //         started_at: new Date(estimated_started_at * 1000),
    //         ended_at: ended_at ? new Date(ended_at * 1000) : null,
    //         workspace_id,
    //       },
    //     });
    //   }
    //   return c.json(200);
  }

  if (event === "people.registered") {
    //   const parsedAttributes = PeopleRegisteredSchema.parse(attributes);
    //   const {
    //     first_name,
    //     last_name,
    //     email,
    //     avatar_link,
    //     registrant_detail,
    //     role,
    //   } = parsedAttributes;
    //   if (role === "team_member") return c.json(200);
    //   const { session_id, ip_country_code } = registrant_detail;
    //   const session = await getDBEvent({ id: session_id });
    //   const { title } = session;
    //   const locale = ip_country_code
    //     ? getLocaleByAlpha2(ip_country_code)
    //     : null;
    //   const member = await upsertMember({
    //     id,
    //     data: {
    //       first_name,
    //       last_name,
    //       livestorm_id: id,
    //       primary_email: email,
    //       avatar_url: avatar_link,
    //       locale,
    //     },
    //     source: "LIVESTORM",
    //     workspace_id,
    //   });
    //   await createActivity({
    //     external_id: null,
    //     activity_type_key: "livestorm:register",
    //     message: `Registered to: ${title}`,
    //     member_id: member.id,
    //     event_id: session.id,
    //     workspace_id,
    //   });
    //   await updateMemberMetrics.trigger({ member });
    //   await checkMerging({ member_id: member.id, workspace_id });
    //   return c.json(200);
  }

  if (event === "session.ended") {
    //   const session = await getDBEvent({ id });
    //   const { title } = session;
    //   const peoples = await listPeopleFromSession({ access_token, id });
    //   for (const people of peoples) {
    //     const { id, attributes } = people;
    //     const {
    //       email,
    //       first_name,
    //       last_name,
    //       avatar_link,
    //       registrant_detail,
    //       role,
    //     } = attributes;
    //     if (role === "team_member") continue;
    //     const { ip_country_code, is_guest_speaker } = registrant_detail;
    //     const locale = ip_country_code
    //       ? getLocaleByAlpha2(ip_country_code)
    //       : null;
    //     const member = await upsertMember({
    //       id,
    //       data: {
    //         first_name,
    //         last_name,
    //         livestorm_id: id,
    //         primary_email: email,
    //         avatar_url: avatar_link,
    //         locale,
    //       },
    //       source: "LIVESTORM",
    //       workspace_id,
    //     });
    //     if (is_guest_speaker) {
    //       await createActivity({
    //         external_id: null,
    //         activity_type_key: "livestorm:co-host",
    //         message: `Co-hosted to: ${title}`,
    //         member_id: member.id,
    //         event_id: session.id,
    //         workspace_id,
    //       });
    //       await updateMemberMetrics.trigger({ member });
    //     } else {
    //       await createActivity({
    //         external_id: null,
    //         activity_type_key: "livestorm:attend",
    //         message: `Attended to: ${title}`,
    //         member_id: member.id,
    //         event_id: session.id,
    //         workspace_id,
    //       });
    //       await updateMemberMetrics.trigger({ member });
    //       await checkMerging({ member_id: member.id, workspace_id });
    //     }
    //   }
  }

  return NextResponse.json(200);
}
