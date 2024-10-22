import Image from "next/image";

type Props = {
  label: string;
};

export const SlackBadge = ({ label }: Props) => {
  return (
    <div className="absolute -top-[22px] left-0 w-fit rounded-t bg-slack px-1.5 pb-2 pt-0.5">
      <div className="flex items-center gap-1.5">
        <Image src="/social/slack.svg" alt="Slack" width={12} height={12} />
        <p className="text-[11px] font-medium tracking-tight text-white">
          {label}
        </p>
      </div>
    </div>
  );
};
