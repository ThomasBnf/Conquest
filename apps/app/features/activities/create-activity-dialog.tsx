"use client";

import { Button } from "@conquest/ui/src/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/src/components/dialog";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { useState } from "react";

type Props = {
  member: MemberWithCompany;
};

export const CreateActivityDialog = ({ member }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new activity</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
