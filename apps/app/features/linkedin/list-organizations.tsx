import { linkedinAPI } from "@/actions/linkedin/linkedinAPI";
import { Separator } from "@conquest/ui/separator";
import { Button } from "@conquest/ui/src/components/button";
import { useState } from "react";

export const ListOrganizations = () => {
  const [loading, setLoading] = useState(false);
  // const { data: organization, isLoading } = useListLinkedinOrgs();

  const onClick = async () => {
    await linkedinAPI();
  };

  return (
    <>
      <Separator className="my-4" />
      <p className="font-medium text-base">Organizations</p>
      <Button onClick={onClick}>Let's start!</Button>
      {/* {isLoading ? (
        <LoadingChannels />
      ) : (
        <>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <p>{organization?.localizedName}</p>
                <p>{organization?.localizedDescription}</p>
              </div>
              <Button>Select</Button>
            </div>
          </div>
          {loading && (
            <div className="actions-secondary mt-6 rounded-md border p-4">
              <Info size={18} className="text-muted-foreground" />
              <p className="mt-2 mb-1 font-medium">Collecting data</p>
              <p className="text-muted-foreground">
                You can leave this page while we collect your data.
                <br />
                This may take a few minutes. Please refresh the page to see the
                changes.
              </p>
            </div>
          )}
          <Button
            loading={loading}
            // onClick={onStart}
            className="mt-6"
          >
            Let's start!
          </Button>
        </>
      )} */}
    </>
  );
};
