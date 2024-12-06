type Props = {
  size?: number;
  className?: string;
};

export const Brevo = ({ size = 24, className }: Props) => {
  return (
    <svg
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1098 1553"
      className={className}
    >
      <path
        id="Layer"
        fillRule="evenodd"
        className="s0"
        d="m0 0h584.4c238 0 395.7 145.5 395.7 363.9 0 106-35.4 192.8-110.7 267.8 146.1 94 228.6 239.5 228.6 401.7 0 296.1-268.4 519.2-626.7 519.2h-471.3zm452.3 1350.6c242.8 0 421.9-138.7 421.9-326.4 0-110.4-63.7-216-167.2-277.4-78 39.9-169.6 77.7-280.6 115.2-124.7 39.8-214.2 143.4-214.2 249v239.6zm-240.5-575.5h7.2c23.5-45 87.2-82.4 228.5-127.1 207.4-68.1 308.5-157.4 308.5-274.6 0-103.6-77.6-171.3-195.4-171.3h-348.8z"
      />
    </svg>
  );
};
