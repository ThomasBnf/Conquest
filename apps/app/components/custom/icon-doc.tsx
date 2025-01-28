import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { ExternalLink, InfoIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  url: string;
};

export const IconDoc = ({ url }: Props) => {
  return (
    <Link href={url} target="_blank" className="size-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon size={16} className="text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          <p>View documentation</p>
          <ExternalLink size={16} />
        </TooltipContent>
      </Tooltip>
    </Link>
  );
};
