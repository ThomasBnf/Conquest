import { useIntegration } from "@/context/integrationContext";
import type { installLinkedin } from "@conquest/trigger/tasks/installLinkedin";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const LinkedinForm = () => {
  const { linkedin, setLoading } = useIntegration();
  // const { organizations, user_id, isLoading } = listOrganizations();
  const router = useRouter();

  const [selectedOrg, setSelectedOrg] = useState({
    organization_id: "",
    organization_name: "",
  });

  const { submit, run } = useRealtimeTaskTrigger<typeof installLinkedin>(
    "install-linkedin",
    { accessToken: linkedin?.trigger_token },
  );

  const onStart = async () => {
    // if (!linkedin || !user_id) return;

    setLoading(true);
    // const response = await updateIntegration({
    //   id: linkedin.id,
    //   external_id: selectedOrg.organization_id,
    //   details: {
    //     ...linkedin.details,
    //     name: selectedOrg.organization_name,
    //     user_id,
    //   },
    //   status: "SYNCING",
    // });
    // const updatedLinkedin = LinkedInIntegrationSchema.parse(response?.data);
    // submit({ linkedin: updatedLinkedin });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed) {
      router.refresh();
      toast.error("Failed to install Linkedin", { duration: 5000 });
      // setLoading(false);
    }

    if (isCompleted) router.refresh();
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <p className="font-medium text-base">Organizations</p>
        {/* {isLoading ? (
          <LoadingChannels />
        ) : (
          <RadioGroup
            onValueChange={(value) =>
              setSelectedOrg({
                organization_id: value,
                organization_name: "conquest-sandbox",
              })
            }
          >
            {organizations &&
              Object.entries(organizations).map(([id, organization]) => (
                <div
                  key={id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <RadioGroupItem value={id} id={id} />
                  <Label htmlFor={id}>{organization.localizedName}</Label>
                </div>
              ))}
          </RadioGroup>
        )}
        {loading ? (
          <LoadingMessage />
        ) : (
          <Button onClick={onStart} disabled={!selectedOrg}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Let's start!"
            )}
          </Button>
        )} */}
      </div>
    </>
  );
};
