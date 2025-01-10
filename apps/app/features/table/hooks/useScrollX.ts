import { useEffect, useState } from "react";

type Props = {
  isClient: boolean;
  id: string;
};

export const useScrollX = ({ isClient, id }: Props) => {
  const [scrollX, setScrollX] = useState(0);

  useEffect(() => {
    let rafId: number;
    let element: HTMLElement | null = null;

    const handleScroll = () => {
      if (!element) return;
      setScrollX(element.scrollLeft);
    };

    const findElement = () => {
      element = document.getElementById(id);
      if (!element) {
        rafId = requestAnimationFrame(findElement);
        return;
      }

      element.addEventListener("scroll", handleScroll);
      element.scrollLeft = 0;
    };

    findElement();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, [id, isClient]);

  return scrollX;
};
