"use client";

import { LogOut } from "@/components/icons/LogOut";
import { Button } from "@conquest/ui/button";
import { logOut } from "../auth/actions/sign-out";

export const SignOut = () => {
  const onClick = async () => await logOut();

  return (
    <Button onClick={onClick} variant="outline" className="self-start">
      <LogOut className="size-[18px]" />
      Log out
    </Button>
  );
};
