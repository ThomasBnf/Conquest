import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";

const prompt = (message: string, title?: string) =>
  `
  Analyze this message and return structured JSON:

  ${title ? `${title} | ` : ""}${message}

  ## Required JSON Output (example):

  {
    "sentimentScore": 0.75,
    "sentiment": "positive|neutral|negative", 
    "keywords": ["word1", "word2", "word3"],
    "category": "product|support|marketing|sales|hr|community|general",
    "topics": ["topic1", "topic2"]
  }

  ## Rules:

  **Sentiment:** 0-0.33 = negative, 0.34-0.66 = neutral, 0.67-1 = positive
  **Keywords:** 3-8 lowercase keywords, same language as original message
  **Categories & Allowed Topics:**
  - **product**: feature request, bug report, feedback, integration
  - **support**: technical issue, how-to question, setup help, documentation
  - **marketing**: announcement, content sharing, event promotion, webinar
  - **sales**: pricing inquiry, demo request, billing issue, plan discussion
  - **hr**: job posting, team introduction, company news, culture discussion
  - **community**: member engagement, recognition, moderation, guidelines
  - **general**: introduction, appreciation, off-topic, humor
`;

export const analyzeActivity = async (message: string, title?: string) => {
  return await generateObject({
    model: openai("gpt-3.5-turbo"),
    schema: z.object({
      sentimentScore: z.number().min(0).max(1),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      keywords: z.array(z.string().min(1)).min(5).max(10),
      category: z.enum([
        "product",
        "support",
        "marketing",
        "sales",
        "hr",
        "community",
        "general",
      ]),
      topics: z.array(z.string()).max(5),
    }),
    prompt: prompt(message, title),
  });
};
