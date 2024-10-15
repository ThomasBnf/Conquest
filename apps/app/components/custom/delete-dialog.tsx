import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@conquest/ui/alert-dialog";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
  onConfirm: () => Promise<string | number | undefined>;
};

export const DeleteDialog = ({
  title,
  description,
  children,
  onConfirm,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await onConfirm();
    setIsOpen(false);
    setLoading(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          {children ?? (
            <>
              <Trash2 size={16} />
              Delete
            </>
          )}
        </Button>
      </AlertDialogTrigger>
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
    </AlertDialog>
  );
};
