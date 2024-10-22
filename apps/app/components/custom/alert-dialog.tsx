import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialog as CustomAlertDialog,
} from "@conquest/ui/alert-dialog";
import { Button } from "@conquest/ui/button";
import { useState } from "react";

type Props = {
  title: string;
  description: string;
  onConfirm: () => Promise<string | number | undefined>;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const AlertDialog = ({
  title,
  description,
  onConfirm,
  open,
  setOpen,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await onConfirm();
    setOpen(false);
    setLoading(false);
  };

  return (
    <CustomAlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" loading={loading} onClick={onClick}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </CustomAlertDialog>
  );
};
