import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
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
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => onClick("{{createdMember}}")}
          className="capitalize"
        >
          Created member data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {[
          "First Name",
          "Last Name",
          "Primary Email",
          "Country",
          "Language",
          "Job Title",
          "LinkedIn URL",
          "Emails",
          "Phones",
          "Level",
          "Level Name",
        ].map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onClick(`{{${key.replaceAll(" ", "")}}}`)}
            className="capitalize"
          >
            {key.replace(/_/g, " ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
