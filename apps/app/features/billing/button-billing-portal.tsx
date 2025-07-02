import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const ButtonBillingPortal = () => {
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

  return (
    <Button onClick={() => mutateAsync({})} disabled={loading}>
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        "Billing Portal"
      )}
    </Button>
  );
};
