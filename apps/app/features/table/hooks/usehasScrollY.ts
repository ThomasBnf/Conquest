import { useEffect, useState } from "react";

type Props = {
  isClient: boolean;
};

export const useHasScrollY = ({ isClient }: Props) => {
  const [hasScrollY, setHasScrollY] = useState(false);

  useEffect(() => {
    const element = document.querySelector("[data-radix-scroll-area-viewport]");
    if (!element) return;

    const checkScroll = () => {
      setHasScrollY(element.scrollHeight > element.clientHeight);
    };

    const handleResize = () => {
      checkScroll();
    };

    checkScroll();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isClient]);

  return hasScrollY;
};
