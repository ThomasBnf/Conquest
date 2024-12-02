import { useEffect, useState } from "react";

export function useIsClient() {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setClient(true);
    }, 50);
  }, []);

  return isClient;
}
