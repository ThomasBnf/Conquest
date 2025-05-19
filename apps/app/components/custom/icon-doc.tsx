import { cn } from "../../../../packages/ui/src/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { ExternalLink, InfoIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  url: string;
  title?: string;
  className?: string;
};

export const IconDoc = ({ url, title, className }: Props) => {
  return (
    <Link href={url} target="_blank" className={cn("size-4", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          {title ? (
            <div className="my-2 flex w-fit items-center gap-1.5 rounded-md border bg-muted p-2">
              <InfoIcon size={16} className="text-muted-foreground" />
              <p>{title}</p>
            </div>
          ) : (
            <InfoIcon size={16} className="text-muted-foreground" />
          )}
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          <p>View documentation</p>
          <ExternalLink size={16} />
        </TooltipContent>
      </Tooltip>
    </Link>
  );
};
