type Props = {
  label: string;
};

export const ActivityBadge = ({ label }: Props) => {
  return (
    <div className="absolute -top-[22px] left-0 flex w-fit items-center gap-2 rounded-t bg-main-500 px-1.5 pb-2 pt-px">
      <p className="text-[11px] font-medium tracking-tight text-white">
        {label}
      </p>
    </div>
  );
};
