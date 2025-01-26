type Props = {
  label: string;
};

export const ActivityBadge = ({ label }: Props) => {
  return (
    <div className=" -top-[22px] absolute left-0 flex w-fit items-center gap-2 rounded-t bg-main-500 px-1.5 pt-px pb-2">
      <p className="font-medium text-[11px] text-white tracking-tight">
        {label}
      </p>
    </div>
  );
};
