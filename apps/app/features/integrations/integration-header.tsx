import { useUser } from "@/context/userContext";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/src/utils/cn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const IntegrationHeader = () => {
  const { slug } = useUser();

  return (
    <Link
      href={`/${slug}/settings/integrations`}
      className={cn(
        buttonVariants({ variant: "link", size: "xs" }),
        "flex w-fit items-center gap-1 text-foreground",
      )}
    >
      <ArrowLeft size={16} />
      Integrations
    </Link>
  );
};
