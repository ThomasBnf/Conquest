import { createIntegration } from "@/queries/integrations/createIntegration";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = user.workspace;

  await createIntegration({
    external_id: null,
    details: {
      source: "DISCOURSE",
      community_url: "",
      api_key: "",
      signature: "",
    },
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/discourse`);
}
