import { useUser } from "@/context/userContext";
import { client } from "@/lib/rpc";
import type { installLinkedin } from "@/trigger/installLinkedin.trigger";
import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { RadioGroup, RadioGroupItem } from "@conquest/ui/radio-group";
import { Separator } from "@conquest/ui/separator";
import type { organizationsResponse } from "@conquest/zod/schemas/types/linkedin";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ListOrganizations = () => {
  const { linkedin } = useUser();
  const [loading, setLoading] = useState(linkedin?.status === "SYNCING");
  const [orgs, setOrgs] = useState<organizationsResponse | null>(null);

  const [selectedOrg, setSelectedOrg] = useState({
    organization_id: "",
    organization_name: "",
  });
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    const response = await client.api.linkedin.organizations.$get();
    const data = await response.json();
    setOrgs(data);
    setLoading(false);
  };

  const { submit, run } = useRealtimeTaskTrigger<typeof installLinkedin>(
    "install-linkedin",
    {
      accessToken: linkedin?.trigger_token,
    },
  );

  const onStart = async () => {
    if (!linkedin) return;
    setLoading(true);
    submit({
      linkedin,
      organization_id: selectedOrg.organization_id,
      organization_name: selectedOrg.organization_name,
    });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed) {
      setLoading(false);
      toast.error("Failed to install Slack", { duration: 5000 });
    }

    if (isCompleted) {
      setLoading(false);
      setSelectedOrg({
        organization_id: "",
        organization_name: "",
      });
      router.refresh();
    }
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <p className="font-medium text-base">Organizations</p>
      {orgs?.results && (
        <RadioGroup
          className="mt-3"
          onValueChange={(value) =>
            setSelectedOrg({
              organization_id: value,
              organization_name: "conquest-sandbox",
            })
          }
        >
          {Object.entries(orgs?.results).map(([id, org]) => (
            <div key={id} className="flex items-center space-x-2">
              <RadioGroupItem value={id} id={id} />
              <Label htmlFor={id}>{org.localizedName}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
      {loading && (
        <div className="actions-secondary mt-6 rounded-md border p-4">
          <Info size={18} className="text-muted-foreground" />
          <p className="mt-2 mb-1 font-medium">Collecting data</p>
          <p className="text-muted-foreground">
            This may take a few minutes.
            <br />
            You can leave this page while we collect your data.
            <br />
            Do not hesitate to refresh the page to see data changes.
          </p>
        </div>
      )}
      {orgs?.results ? (
        <Button
          className="mt-6"
          onClick={onStart}
          loading={loading}
          disabled={!selectedOrg}
        >
          Let's start!
        </Button>
      ) : (
        <Button
          className="mt-4"
          onClick={onClick}
          loading={loading}
          disabled={loading}
        >
          List Organizations
        </Button>
      )}
    </>
  );
};
