import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { MemberSchema } from "@conquest/zod/member.schema";
import { NodeSchema } from "@conquest/zod/node.schema";
import { useReactFlow } from "@xyflow/react";
import { Braces } from "lucide-react";

type Props = {
  onClick: (variable: string) => void;
};

export const VariablePicker = ({ onClick }: Props) => {
  const { getNodes } = useReactFlow();

  const nodes = NodeSchema.array().parse(getNodes());

  const hasCreatedMember = nodes.some(
    (node) => node.data.type === "member-created",
  );
  const hasListMembers = nodes.some(
    (node) => node.data.type === "list-members",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Braces size={14} />
          Variables
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {hasCreatedMember && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              Created Member
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onClick("{{created_member}}")}
                className="gap-2"
              >
                Created member data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(MemberSchema.shape).map(([key]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onClick(`{{created_member.${key}}}`)}
                  className="gap-2 capitalize"
                >
                  {key.replace(/_/g, " ")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {hasListMembers && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              Matching Members
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onClick("{{matching_members}}")}
                className="gap-2"
              >
                Matching members
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onClick("{{matching_members.count}}")}
                className="gap-2"
              >
                Number of matches
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(MemberSchema.shape).map(([key]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onClick(`{{matching_members.${key}}}`)}
                  className="gap-2 capitalize"
                >
                  {key.replace(/_/g, " ")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
