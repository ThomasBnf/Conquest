import { emojiParser } from "./emoji-parser";

type EmojiMatch = {
  original: string;
  start: number;
  end: number;
  parsed: string;
};

export const parseSlackMessage = (message: string) => {
  const emojiPattern = /:([^:\s]+):/g;
  const matches: EmojiMatch[] = [];
  let match = emojiPattern.exec(message);

  // Trouve tous les emojis dans le texte
  while (match !== null) {
    const original = match[0];
    const shortName = match[1];

    matches.push({
      original,
      start: match.index,
      end: match.index + original.length,
      parsed: emojiParser(shortName ?? ""),
    });
    match = emojiPattern.exec(message);
  }

  // Reconstruit le message avec les emojis parsés
  if (matches.length === 0) return message;

  let result = "";
  let lastIndex = 0;

  for (const match of matches) {
    result += message.slice(lastIndex, match.start);
    result += match.parsed;
    lastIndex = match.end;
  }

  result += message.slice(lastIndex);
  return result;
};
