import type { FileWithType } from "@conquest/zod/schemas/file.schema";
import Image from "next/image";

type Props = {
  file: FileWithType;
};

export const SlackImage = ({ file }: Props) => {
  const { url, type } = file;

  if (type === "pdf") {
    return (
      <iframe src={url} className="h-64 w-full" title={url} allowFullScreen />
    );
  }

  return (
    <Image
      unoptimized
      src={url}
      alt={url}
      width={1200}
      height={800}
      className="w-full rounded border"
    />
  );
};
