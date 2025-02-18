import rawEmoji from "@/constant/raw-emoji.json";

export const emojiParser = (reaction: string) => {
  const emoji = rawEmoji.find((emoji) => emoji.short_name === reaction);

  if (!emoji?.unified) {
    return reaction;
  }

  const codePoints = emoji.unified
    .split("-")
    .map((hex) => Number.parseInt(hex, 16));
  return String.fromCodePoint(...codePoints);
};
