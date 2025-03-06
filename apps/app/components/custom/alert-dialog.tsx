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
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
  buttonLabel?: string;
};

export const AlertDialog = ({
  title,
  description,
  onConfirm,
  open,
  setOpen,
  buttonLabel = "Delete",
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
          <AlertDialogDescription className="text-balance">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={onClick}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              buttonLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </CustomAlertDialog>
  );
};
