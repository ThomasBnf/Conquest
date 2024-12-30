"use client";

import { listMerges } from "@/actions/members/listMerges";
import { Button } from "@conquest/ui/src/components/button";
import { Merge } from "lucide-react";

export const MergeButton = () => {
  const onClick = async () => {
    const response = await listMerges();
    console.log(response);
  };

  return (
    <Button variant="outline" onClick={onClick}>
      <Merge size={15} />
      Merge
    </Button>
  );
};
