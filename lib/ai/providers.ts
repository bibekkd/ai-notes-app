const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const DEFAULT_MISTRAL_MODEL = "mistral-small-latest";

type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{
        type?: string;
        text?: string;
      }>;
};

type ProviderResponse = {
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: ProviderMessage;
  }>;
};

type ProviderConfig = {
  apiUrl: string;
  apiKey: string;
  label: string;
  model: string;
  siteUrl?: string;
};

export class AIProviderError extends Error {
  provider: string;
  status: number;
  retryable: boolean;

  constructor(
    message: string,
    provider: string,
    status = 500,
    retryable = false
  ) {
    super(message);
    this.name = "AIProviderError";
    this.provider = provider;
    this.status = status;
    this.retryable = retryable;
  }
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function getSummaryPrompt(text: string) {
  return [
    "Summarize the following note in no more than 150 words.",
    "Keep the summary clear, factual, and easy to scan.",
    "Return only the summary text with no prefacing.",
    "",
    text.trim(),
  ].join("\n");
}

function extractTextContent(content: ProviderMessage["content"]) {
  if (typeof content === "string") {
    return content.trim();
  }

  return content
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function parseErrorMessage(response: Response, provider: string) {
  try {
    const data = (await response.json()) as ProviderResponse;

    return (
      data.error?.message ||
      `${provider} request failed with status ${response.status}`
    );
  } catch {
    return `${provider} request failed with status ${response.status}`;
  }
}

async function summarizeWithProvider(
  text: string,
  { apiUrl, apiKey, label, model, siteUrl }: ProviderConfig
) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
      "X-Title": "Smart Notes",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful note summarizer. Follow the user's constraints exactly.",
        },
        {
          role: "user",
          content: getSummaryPrompt(text),
        },
      ],
      temperature: 0.2,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    throw new AIProviderError(
      await parseErrorMessage(response, label),
      label,
      response.status,
      isRetryableStatus(response.status)
    );
  }

  const data = (await response.json()) as ProviderResponse;
  const content = data.choices?.[0]?.message?.content;
  const summary = content ? extractTextContent(content) : "";

  if (!summary) {
    throw new AIProviderError(
      `${label} returned an empty summary. Please try again.`,
      label,
      502,
      true
    );
  }

  return summary;
}

function getGroqApiKey() {
  return (
    process.env.GROQ_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim() ||
    ""
  );
}

function getMistralApiKey() {
  return (
    process.env.MISTRAL_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_MISTRAL_API_KEY?.trim() ||
    ""
  );
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim();
}

export async function summarizeWithGroq(text: string) {
  const apiKey = getGroqApiKey();

  if (!apiKey) {
    throw new AIProviderError(
      "Groq API key is missing. Set GROQ_API_KEY in your server environment.",
      "Groq",
      500
    );
  }

  return summarizeWithProvider(text, {
    apiUrl: GROQ_API_URL,
    apiKey,
    label: "Groq",
    model: process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
    siteUrl: getSiteUrl(),
  });
}

export async function summarizeWithMistral(text: string) {
  const apiKey = getMistralApiKey();

  if (!apiKey) {
    throw new AIProviderError(
      "Mistral API key is missing. Set MISTRAL_API_KEY in your server environment.",
      "Mistral",
      500
    );
  }

  return summarizeWithProvider(text, {
    apiUrl: MISTRAL_API_URL,
    apiKey,
    label: "Mistral",
    model: process.env.MISTRAL_MODEL?.trim() || DEFAULT_MISTRAL_MODEL,
    siteUrl: getSiteUrl(),
  });
}

export async function summarizeWithFallbackProviders(text: string) {
  try {
    return await summarizeWithGroq(text);
  } catch (error: unknown) {
    if (!(error instanceof AIProviderError)) {
      throw error;
    }

    const mistralKeyPresent = Boolean(getMistralApiKey());

    if (!error.retryable || !mistralKeyPresent) {
      throw error;
    }

    return summarizeWithMistral(text);
  }
}
