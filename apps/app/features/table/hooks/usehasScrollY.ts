import { useEffect, useState } from "react";

type Props = {
  dependencies: unknown[];
};

export const useHasScrollY = ({ dependencies }: Props) => {
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
  }, dependencies);

  return hasScrollY;
};
