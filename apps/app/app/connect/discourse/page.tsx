import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { redirect } from "next/navigation";

export default async function Page() {
  const { id: userId, workspaceId } = await getCurrentUser();

  await createIntegration({
    externalId: null,
    details: {
      source: "Discourse",
      communityUrl: "",
      apiKey: "",
      apiKeyIv: "",
      userFields: [],
    },
    createdBy: userId,
    workspaceId,
  });

  redirect("/settings/integrations/discourse");
}
