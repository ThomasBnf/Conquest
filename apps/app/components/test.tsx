"use client";

import { test } from "@/actions/test";
import { Button } from "@conquest/ui/button";
import { useState } from "react";

type SearchResult = {
  originalMember: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    primary_email: string | null;
  };
  similarMember: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    primary_email: string | null;
  };
  similarity: number | undefined;
};

export const Test = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult[]>([]);

  const onClick = async () => {
    setLoading(true);
    const response = await test();
    setResult(response?.data ?? []);
    setLoading(false);
  };

  return (
    <div>
      <Button onClick={onClick} loading={loading}>
        Test
      </Button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};
