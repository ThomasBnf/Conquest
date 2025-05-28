import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Braces, Hash } from "lucide-react";

type Props = {
  source: "Slack" | "Discord";
  onClick: (variable: string) => void;
};

export const ChannelVariablePicker = ({ source, onClick }: Props) => {
  const { data } = trpc.channels.list.useQuery({ source });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Braces size={14} />
          Channels
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {data?.map((key) => (
          <DropdownMenuItem
            key={key.id}
            onClick={() => onClick(`{{#${key.name}}}`)}
            className="gap-1"
          >
            <Hash size={14} />
            {key.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
