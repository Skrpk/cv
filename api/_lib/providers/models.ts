// Model ids live here so swapping them is a one-line change.
// Claude defaults to Haiku for quick analysis; Sonnet is the "deep" option.
// OpenAI uses a cheap model. All swappable.

export const MODELS = {
  claude: {
    analyze: "claude-haiku-5-5",
    deep: "claude-sonnet-5-5",
  },
  openai: {
    analyze: "gpt-4o-mini",
  },
} as const;
