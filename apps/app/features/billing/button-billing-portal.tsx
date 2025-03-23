import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const ButtonBillingPortal = () => {
  const { data: session } = useSession();
  const { plan } = session?.user.workspace ?? {};
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
    <div className="space-y-2 rounded-md border p-4">
      <p className="text-muted-foreground">
        Current plan:{" "}
        <span className="font-medium text-foreground">{plan}</span>
      </p>
      <Button
        onClick={() => mutateAsync({})}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Billing Portal"
        )}
      </Button>
    </div>
  );
};
