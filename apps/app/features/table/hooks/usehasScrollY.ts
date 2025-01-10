import { useEffect, useState } from "react";

type Props = {
  isClient: boolean;
  id: string;
};

export const useHasScrollY = ({ isClient, id }: Props) => {
  const [hasScrollY, setHasScrollY] = useState(false);

  useEffect(() => {
    let rafId: number;
    let element: HTMLElement | null = null;

    const checkScroll = () => {
      if (!element) return;
      setHasScrollY(element.scrollHeight > element.clientHeight);
    };

    const handleResize = () => {
      checkScroll();
    };

    const findElement = () => {
      element = document.getElementById(id);
      if (!element) {
        rafId = requestAnimationFrame(findElement);
        return;
      }

      checkScroll();
      window.addEventListener("resize", handleResize);
    };

    findElement();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [id, isClient]);

  return hasScrollY;
};
