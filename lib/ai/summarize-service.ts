import {
  AIProviderError,
  summarizeWithFallbackProviders,
} from "./providers.ts";

type SummarizeResponseBody =
  | { summary: string }
  | { error: string };

type SummarizeResult = {
  body: SummarizeResponseBody;
  status: number;
};

type Summarizer = (text: string) => Promise<string>;

export async function createSummarizeResponse(
  text: string | undefined,
  summarizer: Summarizer = summarizeWithFallbackProviders
): Promise<SummarizeResult> {
  if (!text || text.trim().length === 0) {
    return {
      body: { error: "Text content is required" },
      status: 400,
    };
  }

  try {
    const summary = await summarizer(text);

    return {
      body: { summary },
      status: 200,
    };
  } catch (error: unknown) {
    if (error instanceof AIProviderError) {
      return {
        body: { error: error.message },
        status: error.status,
      };
    }

    return {
      body: {
        error:
          error instanceof Error
            ? error.message
            : "Failed to summarize text",
      },
      status: 500,
    };
  }
}
