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
import { type HTMLAttributes, type ReactNode, useState } from "react";

type Props = HTMLAttributes<HTMLButtonElement> & {
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
  className,
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
        <Button variant="destructive" className={className}>
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
              {children ?? (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
