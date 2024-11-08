import { ScrollArea } from "@conquest/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";

type Props = {
  value: string;
  onChange: (time: string) => void;
};

export const TimePicker = ({ value, onChange }: Props) => {
  return (
    <Select defaultValue={value} onValueChange={(e) => onChange(e)}>
      <SelectTrigger>
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[15rem]">
          {Array.from({ length: 24 * 4 }).map((_, i) => {
            const hour = Math.floor(i / 4)
              .toString()
              .padStart(2, "0");
            const minute = ((i % 4) * 15).toString().padStart(2, "0");
            const time = `${hour}:${minute}`;
            return (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            );
          })}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};
