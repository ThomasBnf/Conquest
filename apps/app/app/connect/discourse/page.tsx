import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/queries/integration/createIntegration";
import { redirect } from "next/navigation";

export default async function Page() {
  const { id: userId, workspace_id } = await getCurrentUser();

  await createIntegration({
    external_id: workspace_id,
    details: {
      source: "DISCOURSE",
      community_url: "",
      community_url_iv: "",
      api_key: "",
      api_key_iv: "",
      user_fields: [],
    },
    created_by: userId,
    workspace_id,
  });

  redirect("/settings/integrations/discourse");
}
