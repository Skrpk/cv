import OpenAI from "openai";
import type { CompletionProvider, JsonCompletionInput } from "./provider";
import { MODELS } from "./models";

export function createOpenAiProvider(): CompletionProvider {
  return {
    name: "openai",
    async completeJson({
      system,
      user,
      maxTokens = 1024,
    }: JsonCompletionInput): Promise<string> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

      const client = new OpenAI({ apiKey });
      const res = await client.chat.completions.create({
        model: MODELS.openai.analyze,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

      return res.choices[0]?.message?.content ?? "";
    },
  };
}
