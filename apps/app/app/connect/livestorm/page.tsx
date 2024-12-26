type Props = {
  searchParams: {
    code: string;
  };
};

export default async function Page({ searchParams: { code } }: Props) {
  // const user = await getCurrentUser();
  // const { slug, id: workspace_id } = user.workspace;
  // const params = new URLSearchParams({
  //   grant_type: "authorization_code",
  //   client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
  //   client_secret: env.LIVESTORM_CLIENT_SECRET,
  //   code,
  //   redirect_uri: "https://app.useconquest.com/connect/livestorm",
  // });
  // const response = await fetch(
  //   `https://app.livestorm.co/oauth/token?${params.toString()}`,
  //   {
  //     method: "POST",
  //   },
  // );
  // const data = await response.json();
  // const { access_token, expires_in, refresh_token, scope } = data;
  // await createIntegration({
  //   external_id: null,
  //   details: {
  //     source: "LIVESTORM",
  //     organization_id: "",
  //     access_token,
  //     refresh_token,
  //     expires_in,
  //     scope,
  //   },
  //   workspace_id,
  // });
  // redirect(`/${slug}/settings/integrations/livestorm`);
}
