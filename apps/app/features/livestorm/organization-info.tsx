import { useUser } from "@/context/userContext";
import { listLivestormOrganization } from "@/client/livestorm/listLivestormOrganization";
import type { installLivestorm } from "@/trigger/installLivestorm.trigger";
import { Button } from "@conquest/ui/button";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const OrganizationInfo = () => {
  const { livestorm } = useUser();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { data, isLoading } = listLivestormOrganization();
  const { included } = data ?? {};

  const { submit, run } = useRealtimeTaskTrigger<typeof installLivestorm>(
    "install-livestorm",
    {
      accessToken: livestorm?.trigger_token,
    },
  );

  const onStart = async () => {
    if (!livestorm) return;

    setLoading(true);

    const organization_id = included?.at(0)?.id ?? "";
    const organization_name = included?.at(0)?.attributes.name ?? "";

    submit({ livestorm, organization_id, organization_name });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed) {
      setLoading(false);
      toast.error("Failed to install Livestorm", { duration: 5000 });
    }

    if (isCompleted) router.refresh();
  }, [run]);

  useEffect(() => {
    if (!isLoading && data) onStart();
  }, [isLoading, data]);

  return (
    <>
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
      <Button loading={loading} className="mt-6">
        Let's start!
      </Button>
    </>
  );
};
