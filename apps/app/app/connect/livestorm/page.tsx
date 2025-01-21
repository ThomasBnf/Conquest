import { env } from "@/env.mjs";
import { createIntegration } from "@/queries/integrations/createIntegration";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    code: string;
  };
};

export default async function Page({ searchParams: { code } }: Props) {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = user.workspace;

  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
    client_secret: env.LIVESTORM_CLIENT_SECRET,
    code,
  });

  console.log(params);

  const response = await fetch(
    `https://app.livestorm.co/oauth/token?${params.toString()}`,
    {
      method: "POST",
    },
  );

  console.log(await response.json());

  if (!response.ok) {
    return redirect(
      `/${slug}/settings/integrations/livestorm?error=invalid_code`,
    );
  }

  const data = await response.json();
  const { access_token, expires_in, refresh_token, scope } = data;

  await createIntegration({
    external_id: null,
    details: {
      source: "LIVESTORM",
      name: "",
      access_token,
      refresh_token,
      expires_in,
      scope,
    },
    created_by: user.id,
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/livestorm`);
}
