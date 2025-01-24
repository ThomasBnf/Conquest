import { createIntegration } from "@/queries/integrations/createIntegration";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = user.workspace;

  await createIntegration({
    external_id: user.workspace_id,
    details: {
      source: "DISCOURSE",
      community_url: "",
      api_key: "",
      user_fields: [],
    },
    created_by: user.id,
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/discourse`);
}
