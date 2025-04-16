"use client";

import { trpc } from "@/server/client";
import { LogoType } from "@conquest/ui/brand/logo-type";
import { Button } from "@conquest/ui/button";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const WelcomePage = () => {
  const { data: session, update } = useSession();
  const { user } = session ?? {};
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.users.update.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      update();
      router.push("/settings/integrations");
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const onComplete = async () => {
    if (!user) return;

    await mutateAsync({ id: user.id, onboarding: new Date() });
  };

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center">
        <LogoType width={175} />
        <h1 className="mb-4 font-bold text-5xl text-foreground">
          Welcome to Conquest
        </h1>
        <p className="mb-8 max-w-xl text-balance text-center text-muted-foreground">
          Conquest is the CRM you need to track, understand, engage and scale
          your community.
        </p>
        <Button
          onClick={onComplete}
          disabled={loading}
          size="lg"
          className="min-w-64"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </>
  );
};
