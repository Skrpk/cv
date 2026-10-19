import Anthropic from "@anthropic-ai/sdk";
import type { CompletionProvider, JsonCompletionInput } from "./provider";
import { MODELS } from "./models";

export function createClaudeProvider(): CompletionProvider {
  return {
    name: "claude",
    async completeJson({
      system,
      user,
      maxTokens = 1024,
    }: JsonCompletionInput): Promise<string> {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

      const client = new Anthropic({ apiKey });
      const res = await client.messages.create({
        model: MODELS.claude.analyze,
        max_tokens: maxTokens,
        system,
        messages: [
          { role: "user", content: user },
          // Prefill the assistant turn with "{" so the model must continue
          // with a JSON object; we prepend it back below.
          { role: "assistant", content: "{" },
        ],
      });

      const body = res.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      return "{" + body;
    },
  };
}
