import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Braces } from "lucide-react";
import { useWorkflow } from "../context/workflowContext";

type Props = {
  onClick: (variable: string) => void;
};

export const MemberVariablePicker = ({ onClick }: Props) => {
  const { node } = useWorkflow();
  const isSlack = node?.data.type === "slack-message";
  const isDiscord = node?.data.type === "discord-message";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Braces size={14} />
          Member
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => onClick("{{createdMember}}")}>
          Created Member Data
        </DropdownMenuItem>
        {isSlack && (
          <DropdownMenuItem onClick={() => onClick("{{@slackProfile}}")}>
            Slack Profile
          </DropdownMenuItem>
        )}
        {isDiscord && (
          <DropdownMenuItem onClick={() => onClick("{{@discordProfile}}")}>
            Discord Profile
          </DropdownMenuItem>
        )}
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
            onClick={() =>
              onClick(
                `{{${key.slice(0, 1).toLowerCase()}${key.slice(1).replaceAll(" ", "")}}}`,
              )
            }
            className="capitalize"
          >
            {key.replace(/_/g, " ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
