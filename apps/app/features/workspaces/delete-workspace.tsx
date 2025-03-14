"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const DeleteWorkspace = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { mutateAsync } = trpc.workspaces.delete.useMutation({
    onSuccess: () => {
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
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="font-medium text-base">Delete workspace</p>
            <p className="text-muted-foreground text-sm">
              Once deleted, your workspace cannot be recovered
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="destructive" onClick={() => setOpen(true)}>
            <Trash2 className="size-4" />
            Delete workspace
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
