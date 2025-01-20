import { env } from "@/env.mjs";
import { createActivity } from "@/queries/activities/createActivity";
import { deleteActivity } from "@/queries/activities/deleteActivity";
import { getIntegration } from "@/queries/integrations/getIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { getPeople } from "@/queries/linkedin/getPeople";
import { getPost } from "@/queries/linkedin/getPost";
import { getMember } from "@/queries/members/getMember";
import { upsertMember } from "@/queries/members/upsertMember";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import {
  ListOrganizationsSchema,
  OrganizationsSchema,
  WebhookSubscriptionSchema,
} from "@conquest/zod/types/linkedin";
import { getLocaleByAlpha2 } from "country-locale-map";
import { Hono } from "hono";
import { createHmac } from "node:crypto";

const generateChallengeResponse = (
  challengeCode: string,
  clientSecret: string,
) => {
  const hmac = createHmac("sha256", clientSecret);
  hmac.update(challengeCode);
  return hmac.digest("hex");
};

export const linkedin = new Hono()
  .get("/", async (c) => {
    const searchParams = new URL(c.req.url).searchParams;
    const challengeCode = searchParams.get("challengeCode")!;

    const clientSecret = env.LINKEDIN_CLIENT_SECRET as string;
    const challengeResponse = generateChallengeResponse(
      challengeCode,
      clientSecret,
    );

    return c.json({ challengeCode, challengeResponse });
  })
  .post("/", async (c) => {
    const body = WebhookSubscriptionSchema.parse(await c.req.json());
    const notification = body.notifications[0];

    console.log("notification", notification);

    if (!notification) {
      console.error("LinkedIn webhook: Missing notification");
      return c.json({ error: "Missing notification" }, 200);
    }

    const {
      action,
      sourcePost,
      subscriber,
      organizationalEntity,
      decoratedSourcePost,
    } = notification;

    const organizationId = organizationalEntity?.split(":")[3];
    const linkedinId = subscriber?.split(":")[3];

    if (!organizationId || !linkedinId || !sourcePost) {
      console.error("LinkedIn webhook: Missing required fields", {
        organizationId,
        linkedinId,
        sourcePost,
      });
      return c.json({ error: "Missing required fields" }, 200);
    }

    const integration = LinkedInIntegrationSchema.parse(
      await getIntegration({
        external_id: organizationId,
      }),
    );

    if (!integration) {
      console.log("No integration");
      return c.json({ error: "No integration" }, 200);
    }

    const { workspace_id } = integration;
    const { entity } = decoratedSourcePost;

    const post = await getPost({
      urn: entity,
      workspace_id,
    });

    if (!post) {
      console.log("No post");
      return c.json({ error: "No post" }, 200);
    }

    let member: MemberWithCompany | null = null;

    member = await getMember({
      linkedin_id: linkedinId,
      workspace_id,
    });

    if (!member) {
      const people = await getPeople({
        linkedin: integration,
        people_id: linkedinId,
      });

      const {
        id,
        vanityName,
        headline,
        profilePicture,
        localizedFirstName,
        localizedLastName,
        localizedHeadline,
      } = people;

      const countryCode = headline.preferredLocale.country;
      const locale = getLocaleByAlpha2(countryCode) ?? null;
      console.log(locale);
      const avatar_url = profilePicture["displayImage~"]?.elements?.find(
        (element) => element?.artifact?.includes("800_800"),
      )?.identifiers?.[0]?.identifier;

      member = await upsertMember({
        id,
        data: {
          linkedin_id: id,
          username: vanityName,
          first_name: localizedFirstName,
          last_name: localizedLastName,
          locale,
          avatar_url,
          job_title: localizedHeadline,
          source: "LINKEDIN",
          workspace_id,
        },
      });
    }

    console.log(member);

    if (action === "LIKE") {
      const activity = await createActivity({
        external_id: null,
        activity_type_key: "linkedin:like",
        message: "Like",
        react_to: post.external_id,
        member_id: member.id,
        workspace_id,
      });

      console.log("like", activity);

      return c.json({ success: true }, 200);
    }

    if (action === "COMMENT") {
      const { text, entity } = decoratedSourcePost;
      const external_id = entity.split(":")[3];

      const activity = await createActivity({
        external_id: external_id ?? null,
        activity_type_key: "linkedin:comment",
        message: text,
        reply_to: post.external_id,
        member_id: member.id,
        workspace_id,
      });

      console.log("comment", activity);

      return c.json({ success: true }, 200);
    }

    if (action === "COMMENT_DELETE") {
      const { entity } = decoratedSourcePost;
      const external_id = entity.split(":")[3];

      const activity = await deleteActivity({
        external_id,
        workspace_id,
      });

      console.log("delete", activity);
    }

    return c.json({ success: false }, 200);
  })
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/organizations", async (c) => {
    const { workspace } = c.get("user");

    const integration = workspace.integrations.find(
      (integration) => integration.details.source === "LINKEDIN",
    );

    const parsedIntegration = LinkedInIntegrationSchema.parse(integration);
    const { details } = parsedIntegration;
    const { access_token } = details;

    const response = await fetch(
      "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    const organizationsList = ListOrganizationsSchema.parse(
      await response.json(),
    );

    const userId = organizationsList.elements[0]?.roleAssignee.split(":")[3];

    if (userId) {
      await updateIntegration({
        id: parsedIntegration?.id,
        details: {
          ...parsedIntegration?.details,
          user_id: userId,
        },
      });
    }

    const organizationsIds = organizationsList.elements
      .map((org) => org.organizationalTarget.split(":").pop())
      .join(",");

    const orgsResponse = await fetch(
      `https://api.linkedin.com/v2/organizations?ids=List(${organizationsIds})`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );

    return c.json(OrganizationsSchema.parse(await orgsResponse.json()));
  });
