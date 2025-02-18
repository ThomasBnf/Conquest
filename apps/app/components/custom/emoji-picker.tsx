import { Button } from "@conquest/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useState } from "react";

type Props = {
  value?: string;
  onSelect: (emoji: string) => void;
  defaultValue?: string;
};

export const EmojiPicker = ({ value, onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="size-9 text-xl">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Picker
          data={data}
          theme="light"
          autoFocus
          navPosition="none"
          previewPosition="none"
          skinTonePosition="none"
          onEmojiSelect={(emoji: { native: string }) => {
            onSelect(emoji.native);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
