import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { differenceInDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const TrialCard = () => {
  const { data: workspace } = trpc.workspaces.get.useQuery();
  const { trialEnd, isPastDue } = workspace ?? {};
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.stripe.createBillingPortal.useMutation({
    onMutate: () => setLoading(true),
    onSuccess: (url) => router.push(url),
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  if (isPastDue) return;
  if (!trialEnd) return;
  const differenceInDay = differenceInDays(trialEnd, new Date());

  return (
    <Button
      variant="ghost"
      size="default"
      className="justify-between rounded-none border-t"
      onClick={() => mutateAsync({ paymentMethodUpdate: true })}
      disabled={loading}
    >
      {differenceInDay} days left on trial
      {loading ? (
        <Loader2
          size={16}
          className="ml-auto animate-spin text-muted-foreground"
        />
      ) : (
        <Badge variant="outline">Add billing</Badge>
      )}
    </Button>
  );
};
