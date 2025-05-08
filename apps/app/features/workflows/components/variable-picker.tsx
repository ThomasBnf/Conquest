import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Braces } from "lucide-react";

type Props = {
  onClick: (variable: string) => void;
};

export const VariablePicker = ({ onClick }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Braces size={14} />
          Variables
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="h-56 w-48">
        <ScrollArea className="h-full">
          {Object.entries(
            MemberSchema.pick({
              firstName: true,
              lastName: true,
              primaryEmail: true,
              country: true,
              language: true,
              jobTitle: true,
              linkedinUrl: true,
              emails: true,
              phones: true,
            }).shape,
          ).map(([key]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onClick(`{{${key}}}`)}
              className="gap-2 capitalize"
            >
              {key.replace(/_/g, " ")}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
