import { useUser } from "@/context/userContext";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

export const SlackImage = ({ url }: { url: string }) => {
  const { slack } = useUser();

  const { data } = useQuery({
    queryKey: ["slack-image", url],
    queryFn: async () => {
      const response = await fetch(
        `/api/slack/file?url=${url}&token=${slack?.token}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${slack?.token}` },
        },
      );

      return (await response.json()) as { url: string; type: string };
    },
  });

  if (!data?.url) return null;

  if (data.type === "pdf") {
    return (
      <iframe
        src={data.url}
        className="w-full h-64"
        title={url}
        allowFullScreen
      />
    );
  }

  return (
    <Image
      unoptimized
      src={data?.url}
      alt={url}
      width={1200}
      height={800}
      className="border rounded w-full"
    />
  );
};
