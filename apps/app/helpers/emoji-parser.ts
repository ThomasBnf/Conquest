import rawEmoji from "@/constant/raw-emoji.json";

export const emojiParser = (reaction: string) => {
  return String.fromCodePoint(
    Number.parseInt(
      rawEmoji.find((emoji) => emoji.short_name === reaction)?.unified || "0",
      16,
    ),
  );
};
