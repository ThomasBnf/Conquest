import { useUser } from "@/context/userContext";
import { client } from "@/lib/rpc";
import type { installLinkedin } from "@/trigger/installLinkedin.trigger";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ListOrganizations = () => {
  const { linkedin } = useUser();
  const [loading, setLoading] = useState(linkedin?.status === "SYNCING");
  const [selectedOrg, setSelectedOrg] = useState("105844665");
  const router = useRouter();

  const onClick = async () => {
    const response = await client.api.linkedin.organizations.$get();
    const data = await response.json();
    console.log(data);
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
    submit({ linkedin, organization_id: selectedOrg });
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
      setSelectedOrg("");
      router.refresh();
    }
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      {!selectedOrg && <Button onClick={onClick}>List Organizations</Button>}
      <p className="font-medium text-base">Organizations</p>
      {/* <RadioGroup
        className="mt-3"
        onValueChange={(value) => setSelectedOrg(value)}
      >
        {Object.values(data.results).map((org) => (
          <div key={org.id} className="flex items-center space-x-2">
            <RadioGroupItem value={org.id.toString()} id={org.id.toString()} />
            <Label htmlFor={org.id.toString()}>{org.localizedName}</Label>
          </div>
        ))}
      </RadioGroup> */}
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
      <Button
        className="mt-6"
        onClick={onStart}
        loading={loading}
        disabled={!selectedOrg}
      >
        Let's start!
      </Button>
    </>
  );
};
