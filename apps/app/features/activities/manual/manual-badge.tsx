import { Manual } from "@/components/icons/Manual";

type Props = {
  label: string;
};

export const ManualBadge = ({ label }: Props) => {
  return (
    <div className="-top-[22px] absolute left-0 w-fit rounded-t bg-main-500 px-1.5 pt-0.5 pb-2">
      <div className="flex items-center gap-1.5">
        <Manual size={14} theme="dark" />
        <p className="font-medium text-[11px] text-white tracking-tight">
          {label}
        </p>
      </div>
    </div>
  );
};
