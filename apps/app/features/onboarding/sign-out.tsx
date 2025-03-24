"use client";

import { Button } from "@conquest/ui/button";
import { LogOut } from "@conquest/ui/icons/LogOut";
import { signOut } from "next-auth/react";

export const SignOut = () => {
  const onSignOut = () => {
    signOut({
      redirectTo: "/auth/login",
    });
  };

  return (
    <Button onClick={onSignOut} variant="outline" className="self-start">
      <LogOut className="size-[18px]" />
      Log out
    </Button>
  );
};
