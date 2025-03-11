import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { InfoIcon } from "lucide-react";

type Props = {
  content: string | React.ReactNode;
};

export const TooltipInfo = ({ content }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon size={16} className="text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="w-fit max-w-[300px]" side="bottom">
        {typeof content === "string" ? <p>{content}</p> : content}
      </TooltipContent>
    </Tooltip>
  );
};
