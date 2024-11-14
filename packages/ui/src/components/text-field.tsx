import { Textarea } from "@/components/textarea";
import { cn } from "@/utils/cn";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
} from "react";

export const TextField = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(({ onChange, className, rows = 1, ...props }, ref) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    }
  };

  return (
    <Textarea
      ref={ref}
      onChange={(e) => {
        handleChange(e);
        onChange?.(e);
      }}
      rows={rows}
      className={cn(className, "w-full resize-none outline-none")}
      {...props}
    />
  );
});

TextField.displayName = "TextField";
