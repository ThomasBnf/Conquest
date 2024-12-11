import { oauthV2 } from "@/actions/slack/oauthV2";
import { useUser } from "@/context/userContext";
import { env } from "@/env.mjs";
import { Button } from "@conquest/ui/src/components/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SCOPES } from "../constant/scopes";
import { USER_SCOPES } from "../constant/user-scopes";

type Props = {
  code: string | null;
};

export const InstallButton = ({ code }: Props) => {
  const { slug } = useUser();
  const [loading, setLoading] = useState(!!code);
  const router = useRouter();

  const onClick = () => {
    setLoading(true);

    const baseUrl = "https://slack.com/oauth/v2/authorize";
    const clientId = `client_id=${env.NEXT_PUBLIC_SLACK_CLIENT_ID}`;
    const scopesParams = `scope=${SCOPES}`;
    const userScopeParams = `user_scope=${USER_SCOPES}`;
    const redirectURI = `redirect_uri=${encodeURIComponent(`${env.NEXT_PUBLIC_SLACK_REDIRECT_URI}/${slug}/settings/integrations/slack`)}`;

    router.push(
      `${baseUrl}?${clientId}&${scopesParams}&${userScopeParams}&${redirectURI}`,
    );
  };

  const onConnect = async () => {
    if (!code) return;

    router.replace(`/${slug}/settings/integrations/slack`);

    const result = await oauthV2({ code });
    const error = result?.serverError;

    if (error) {
      setLoading(false);
      toast.error(error);
      return;
    }

    setLoading(false);
  };

  useEffect(() => {
    onConnect();
  }, [code]);

  return (
    <Button onClick={onClick} loading={loading}>
      Install
    </Button>
  );
};
