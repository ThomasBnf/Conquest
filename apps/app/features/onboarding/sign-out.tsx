"use client";

import { LogOut } from "@/components/icons/LogOut";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { useRouter } from "next/navigation";

export const SignOut = () => {
  const router = useRouter();

  const { mutateAsync } = trpc.auth.signout.useMutation({
    onSuccess: () => {
      router.push("/auth/login");
    },
  });

  const onClick = async () => await mutateAsync();

  return (
    <Button onClick={onClick} variant="outline" className="self-start">
      <LogOut className="size-[18px]" />
      Log out
    </Button>
  );
};
