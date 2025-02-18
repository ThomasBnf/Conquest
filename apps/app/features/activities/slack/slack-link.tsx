import Link from "next/link";

export const SlackLink = ({ url, title }: { url: string; title: string }) => {
  return (
    <Link
      href={url}
      target="_blank"
      className="text-[#1264a3] hover:text-[#094C8C] hover:underline"
    >
      {title}
    </Link>
  );
};
