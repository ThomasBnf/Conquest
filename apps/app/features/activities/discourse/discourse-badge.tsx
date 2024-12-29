import { Discourse } from "@/components/icons/Discourse";

type Props = {
  label: string;
};

export const DiscourseBadge = ({ label }: Props) => {
  return (
    <div className="-top-[22px] absolute left-0 w-fit rounded-t bg-discourse px-1.5 pt-0.5 pb-2">
      <div className="flex items-center gap-1.5">
        <Discourse size={12} />
        <p className="font-medium text-[11px] text-white tracking-tight">
          {label}
        </p>
      </div>
    </div>
  );
};
