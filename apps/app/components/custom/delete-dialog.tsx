import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@conquest/ui/alert-dialog";
import { Button } from "@conquest/ui/button";
import { Trash2 } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useState } from "react";

type Props = HTMLAttributes<HTMLButtonElement> & {
  title: string;
  description: string;
  onConfirm: () => Promise<string | number | undefined>;
  children?: ReactNode;
};

export const DeleteDialog = ({
  title,
  description,
  onConfirm,
  className,
  children,
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
          <Button variant="destructive" loading={loading} onClick={onClick}>
            {children ?? (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
