import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";

const prompt = (message: string, title?: string) => `
Analyze the following message from a community conversation:

${title}
${message}

Your task is to analyze this message and return a **structured JSON object** that will help us understand the key topic and intent of the message.  
The goal is to enable precise search, segmentation, and trigger relevant actions based on what the community is talking about.

---

🎯 Your output must include the following fields:

- **"sentimentScore"**: A number between 0 and 1 representing how positive the message is.  
  - If \`sentimentScore\` is between 0.00 and 0.33 → sentiment = \`"negative"\`  
  - If \`sentimentScore\` is between 0.34 and 0.66 → sentiment = \`"neutral"\`  
  - If \`sentimentScore\` is above 0.67 → sentiment = \`"positive"\`

- **"sentiment"**: The sentiment label, based on the \`sentimentScore\` ranges above.

- **"keywords"**: A list of 5 to 10 specific, lowercase terms or short expressions that summarize the main subjects discussed in the message.  
  ✅ Use the **same language as the original message**.  
  ✅ All terms must be in lowercase.  
  ✅ Choose terms that are useful for filtering, searching, or categorizing. Avoid vague words like "question" or "message".

- **"category"**: The high-level category the message belongs to. Choose only one from:
  - \`"product"\` → Feature requests, product usage, feedback, bug reports
  - \`"support"\` → Asking for help, troubleshooting, technical issues
  - \`"marketing"\` → Announcements, events, campaigns, content sharing
  - \`"sales"\` → Pricing, procurement, billing, evaluation
  - \`"hr"\` → Jobs, hiring, team building, company culture
  - \`"community"\` → Community engagement, moderation, onboarding, internal dynamics
  - \`"general"\` → Intros, casual talk, unclear or off-topic message

- **"topics"**: A list of 1 to 5 finer-grained **topics or tags**, relevant to the specific content of the message.  
  ✅ The topics must be consistent with the selected category.  
  ❌ Never mix topics from different categories (e.g. no \`feature request\` with \`category: "general"\`).  
  ✅ Choose from the following list:

---

#### Allowed \`topics\` per \`category\`:

- **product**:
  - \`feature request\`
  - \`bug report\`
  - \`product feedback\`
  - \`usability issue\`
  - \`product adoption\`
  - \`integration request\`
  - \`roadmap insight\`

- **support**:
  - \`technical issue\`
  - \`login problem\`
  - \`usage help\`
  - \`data sync issue\`
  - \`api issue\`
  - \`setup guidance\`
  - \`documentation missing\`

- **marketing**:
  - \`event announcement\`
  - \`webinar\`
  - \`content sharing\`
  - \`campaign launch\`
  - \`social media\`
  - \`community challenge\`
  - \`feedback collection\`

- **sales**:
  - \`pricing feedback\`
  - \`billing issue\`
  - \`poc request\`
  - \`discount\`
  - \`plan comparison\`
  - \`renewal discussion\`

- **hr**:
  - \`job offer\`
  - \`team announcement\`
  - \`hiring\`
  - \`onboarding\`
  - \`internal move\`
  - \`company culture\`

- **community**:
  - \`community engagement\`
  - \`member recognition\`
  - \`community feedback\`
  - \`channel creation\`
  - \`moderation\`
  - \`workflow idea\`
  - \`member onboarding\`

- **general**:
  - \`introduction\`
  - \`icebreaker\`
  - \`shout-out\`
  - \`thank you\`
  - \`off-topic\`
  - \`humor\`
  - \`random thoughts\`

---

📝 Rules:
- Return only a valid JSON block inside a markdown \`json\` code block.
- Do **not** add explanations or comments — just the JSON result.
- If the message is ambiguous or unclear, use \`"general"\` for \`"category"\` and leave \`"topics"\` empty.
- Ensure that \`topics\` are always semantically aligned with the selected \`category\`.
- All \`keywords\` must be in lowercase and relevant.
- The \`sentimentScore\` determines the \`sentiment\`, based on the scale:  
  **[0–0.33] = negative**, **[0.34–0.66] = neutral**, **[0.67–1] = positive**
`;

export const sentimentAnalysis = async (message: string, title?: string) => {
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
