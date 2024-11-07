import { useEffect, useState } from "react";

export function useIsClient() {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setClient(true);
    }, 100);
  }, []);

  return isClient;
}
