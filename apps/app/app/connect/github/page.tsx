import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { encrypt } from "@conquest/db/utils/encrypt";
import { generateToken } from "@conquest/trigger/github/generateToken";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    code: string;
    installation_id: number;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { installation_id } = await searchParams;
  const { id: userId, workspaceId } = await getCurrentUser();

  const response = await generateToken(installation_id);

  if (!response.ok) {
    console.error(await response.json());
    return redirect("/settings/integrations/github?error=invalid_code");
  }

  const data = await response.json();
  const { token, expires_at, permissions } = data;

  console.log("page github", data);

  const encryptedAccessToken = await encrypt(token);

  console.log("encryptedAccessToken", encryptedAccessToken);

  await createIntegration({
    externalId: null,
    details: {
      repo: "",
      owner: "",
      source: "Github",
      installationId: installation_id,
      token: encryptedAccessToken.token,
      tokenIv: encryptedAccessToken.iv,
      expiresAt: expires_at,
      permissions,
    },
    createdBy: userId,
    workspaceId,
  });

  redirect("/settings/integrations/github");
}
