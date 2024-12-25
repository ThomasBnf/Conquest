import { linkedinAPI } from "@/actions/linkedin/linkedinAPI";
import { Separator } from "@conquest/ui/separator";
import { Button } from "@conquest/ui/src/components/button";
import { useState } from "react";

export const ListOrganizations = () => {
  const [loading, setLoading] = useState(false);
  // const { data, isLoading } = useListLinkedinOrgs();

  // console.log(data);

  const onClick = async () => {
    await linkedinAPI();
  };

  return (
    <>
      <Separator className="my-4" />
      <p className="font-medium text-base">Organizations</p>
      <Button onClick={onClick}>Linkedin API</Button>
      {/* {isLoading ? (
        <LoadingChannels />
      ) : (
        <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      )} */}
    </>
  );
};
