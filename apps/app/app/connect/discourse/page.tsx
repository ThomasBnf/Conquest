import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { redirect } from "next/navigation";

export default async function Page() {
  const { id: userId, workspace_id } = await getCurrentUser();

  await createIntegration({
    external_id: null,
    details: {
      source: "Discourse",
      community_url: "",
      api_key: "",
      api_key_iv: "",
      user_fields: [],
    },
    created_by: userId,
    workspace_id,
  });

  redirect("/settings/integrations/discourse");
}
