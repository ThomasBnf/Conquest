"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const DeleteAccountCard = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.get.invalidate();
      router.push("/auth/login");
    },
  });

  const onDelete = async () => {
    await mutateAsync();
  };

  return (
    <>
      <AlertDialog
        title="Delete account"
        description="Are you sure you want to delete your account? This action is not reversible."
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action
            is not reversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="mb-0.5 flex justify-end">
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </>
  );
};
