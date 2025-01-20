import { env } from "@/env.mjs";
import { createActivity } from "@/queries/activities/createActivity";
import { deleteActivity } from "@/queries/activities/deleteActivity";
import { getIntegration } from "@/queries/integrations/getIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { getPost } from "@/queries/linkedin/getPost";
import { getMember } from "@/queries/members/getMember";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  ListOrganizationsSchema,
  OrganizationsSchema,
  WebhookSubscriptionSchema,
} from "@conquest/zod/types/linkedin";
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

    if (!notification) {
      console.log("No notification");
      return c.json({ success: false }, 400);
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
      console.log("No organizationId, linkedinId, or sourcePost");
      return c.json({ success: false }, 400);
    }

    const integration = await getIntegration({
      external_id: organizationId,
    });

    if (!integration) {
      console.log("No integration");
      return c.json({ success: false }, 400);
    }

    const { workspace_id } = integration;

    const [post, member] = await Promise.all([
      getPost({
        urn: sourcePost,
        workspace_id,
      }),
      getMember({
        linkedin_id: linkedinId,
        workspace_id,
      }),
    ]);

    if (!member || !post) {
      console.log("No member or post");
      return c.json({ success: false }, 400);
    }

    if (action === "LIKE") {
      await createActivity({
        external_id: null,
        activity_type_key: "linkedin:like",
        message: "Like",
        react_to: post.external_id,
        member_id: member.id,
        workspace_id,
      });
    } else if (action === "COMMENT") {
      const { text, entity } = decoratedSourcePost;
      const external_id = entity.split(":")[3];

      await createActivity({
        external_id: external_id ?? null,
        activity_type_key: "linkedin:comment",
        message: text,
        reply_to: post.external_id,
        member_id: member.id,
        workspace_id,
      });
    } else if (action === "COMMENT_DELETE") {
      const { entity } = decoratedSourcePost;
      const external_id = entity.split(":")[3];

      await deleteActivity({
        external_id,
        workspace_id,
      });
    }

    return c.json({ success: true });
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
