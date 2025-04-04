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
import { Loader2, Trash2 } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useState } from "react";

type Props = HTMLAttributes<HTMLButtonElement> & {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  children?: ReactNode;
};

export const DeleteDialog = ({
  title,
  description,
  onConfirm,
  onCancel,
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

  const onCancelClick = () => {
    setIsOpen(false);
    onCancel?.();
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
          <AlertDialogCancel onClick={onCancelClick}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={loading} onClick={onClick}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              (children ?? (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              ))
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
