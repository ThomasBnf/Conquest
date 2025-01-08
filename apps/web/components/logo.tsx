type Props = {
  size?: number;
};

export const Logo = ({ size = 24 }: Props) => {
  return (
    <div className="flex items-center gap-1.5">
      <img src="/logo.svg" alt="Logo" width={size} height={size} />
      <p className="font-semibold text-base tracking-tight">Conquest</p>
    </div>
  );
};
