import { useUser } from "@/context/userContext";
import { useListLivestormOrganization } from "@/queries/hooks/useListLivestormOrganization";
import type { installLivestorm } from "@/trigger/installLivestorm.trigger.js";
import { Button } from "@conquest/ui/button";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const OrganizationInfo = () => {
  const { livestorm } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { data } = useListLivestormOrganization();

  const { submit, run } = useRealtimeTaskTrigger<typeof installLivestorm>(
    "install-livestorm",
    {
      accessToken: livestorm?.trigger_token,
    },
  );

  const onStart = async () => {
    if (!livestorm || !data) return;

    setLoading(true);
    const organization_id = data.relationships.organization.data.id;

    submit({ livestorm, organization_id });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isCompleted || isFailed) {
      setLoading(false);

      if (isFailed) {
        toast.error("Failed to install Slack", { duration: 5000 });
      }

      router.refresh();
    }
  }, [run]);

  console.log(data);

  return (
    <div>
      <pre className="mt-2">{JSON.stringify(data, null, 2)}</pre>

      <Button
        type="submit"
        className="mt-4"
        onClick={onStart}
        loading={loading}
        disabled={loading}
      >
        Let's start!
      </Button>
    </div>
  );
};
