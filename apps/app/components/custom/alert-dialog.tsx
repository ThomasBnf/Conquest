import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialog as CustomAlertDialog,
} from "@conquest/ui/alert-dialog";
import { Button, buttonVariants } from "@conquest/ui/button";
import { useState } from "react";

type Props = {
  title: string;
  description: string;
  onConfirm: () => Promise<string | number | undefined>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const AlertDialog = ({
  title,
  description,
  onConfirm,
  isOpen,
  setIsOpen,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await onConfirm();
    setIsOpen(false);
    setLoading(false);
  };

  return (
    <CustomAlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            className={buttonVariants({ variant: "destructive" })}
          >
            <Button loading={loading} onClick={onClick}>
              Continue
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </CustomAlertDialog>
  );
};
