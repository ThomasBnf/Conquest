import { useEffect, useState } from "react";

type Props = {
  isClient: boolean;
};

export const useScrollX = ({ isClient }: Props) => {
  const [scrollX, setScrollX] = useState(0);

  useEffect(() => {
    const element = document.querySelector("[data-radix-scroll-area-viewport]");
    if (!element) return;

    const handleScroll = () => {
      setScrollX(element.scrollLeft);
    };

    element.addEventListener("scroll", handleScroll);
    element.scrollLeft = 0;

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [isClient]);

  return scrollX;
};
