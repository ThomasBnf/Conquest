"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const listMerges = authAction
  .metadata({
    name: "listMerges",
  })

  .action(async ({ ctx: { user } }) => {
    const workspace_id = user.workspace_id;

    const members = await prisma.members.findMany({
      where: {
        workspace_id,
      },
      select: {
        first_name: true,
        last_name: true,
        primary_email: true,
        job_title: true,
      },
      take: 100,
    });

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        merges: z.array(
          z.object({
            members: z.array(
              z.object({
                first_name: z.string(),
                last_name: z.string(),
                primary_email: z.string(),
                job_title: z.string(),
              }),
            ),
            confidence: z.number().min(0).max(1),
            reason: z.string(),
          }),
        ),
      }),
      prompt: `Analyze the provided list of members and identify potential duplicates or similar entries based on the following criteria:

        1. Name Matching:
            - Exact matches of first_name AND last_name combinations
            - Consider minor spelling variations/typos when names are very similar
            - Include cases where the order of first and last names is switched (e.g., "John Doe" vs. "Doe John")
            - IMPORTANT: Discard matches where only first names are similar or one entry has an empty last_name

        2. Email Matching:
            - Compare email usernames for similarity regardless of domain
            - Look for matching patterns in email usernames (e.g., john.doe, jdoe, doej all could match)
            - Consider email matches even when names don't match exactly
            - Flag cases where emails match but names are completely different

        Confidence Scoring Rules:
            - Assign high confidence (>0.9) when both names AND emails strongly match
            - Assign medium-high confidence (0.7-0.8) when emails match perfectly but names have minor variations
            - Assign medium confidence (0.5-0.6) for exact name matches with different emails
            - Assign low-medium confidence (0.3-0.4) when only emails show strong similarity
            - Exclude entries with missing required fields (first_name, last_name, or primary_email)

        Output Structure:
        Return an array of potential matches, where each match contains:
            - An array of members identified as potential duplicates
            - Confidence scores based on combined name and email analysis
            - Detailed reasoning explaining both name and email similarities/differences independently

        Here is the list of members: ${JSON.stringify(members)}`,
    });

    return result.object.merges;
  });
