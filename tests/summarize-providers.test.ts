import assert from "node:assert/strict";
import test from "node:test";

import {
  AIProviderError,
  summarizeWithFallbackProviders,
  summarizeWithGroq,
  summarizeWithMistral,
} from "../lib/ai/providers.ts";
import { createSummarizeResponse } from "../lib/ai/summarize-service.ts";

const originalFetch = global.fetch;
const originalEnv = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  NEXT_PUBLIC_GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  NEXT_PUBLIC_MISTRAL_API_KEY: process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
  MISTRAL_MODEL: process.env.MISTRAL_MODEL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

test.afterEach(() => {
  global.fetch = originalFetch;

  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

test("Groq returns a summary from string content", async () => {
  process.env.GROQ_API_KEY = "groq-test-key";
  process.env.GROQ_MODEL = "llama-3.1-8b-instant";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

  let capturedRequest: RequestInit | undefined;

  global.fetch = async (_input, init) => {
    capturedRequest = init;

    return createJsonResponse({
      choices: [{ message: { content: "Groq summary." } }],
    });
  };

  const summary = await summarizeWithGroq("Long note body");

  assert.equal(summary, "Groq summary.");
  assert.ok(capturedRequest);
  assert.equal(
    (capturedRequest.headers as Record<string, string>).Authorization,
    "Bearer groq-test-key"
  );
  assert.equal(
    (capturedRequest.headers as Record<string, string>)["HTTP-Referer"],
    "http://localhost:3000"
  );

  const parsedBody = JSON.parse(String(capturedRequest.body));
  assert.equal(parsedBody.model, "llama-3.1-8b-instant");
  assert.equal(parsedBody.temperature, 0.2);
});

test("Groq falls back to NEXT_PUBLIC_GROQ_API_KEY when needed", async () => {
  delete process.env.GROQ_API_KEY;
  process.env.NEXT_PUBLIC_GROQ_API_KEY = "groq-public-key";

  global.fetch = async () =>
    createJsonResponse({
      choices: [{ message: { content: "Groq public summary." } }],
    });

  const summary = await summarizeWithGroq("Long note body");

  assert.equal(summary, "Groq public summary.");
});

test("Groq surfaces provider rate limit errors", async () => {
  process.env.GROQ_API_KEY = "groq-test-key";

  global.fetch = async () =>
    createJsonResponse(
      {
        error: {
          message: "Rate limit exceeded.",
        },
      },
      429
    );

  await assert.rejects(
    () => summarizeWithGroq("Long note body"),
    (error: unknown) =>
      error instanceof AIProviderError &&
      error.provider === "Groq" &&
      error.status === 429 &&
      error.retryable === true &&
      error.message === "Rate limit exceeded."
  );
});

test("Mistral supports content arrays", async () => {
  process.env.MISTRAL_API_KEY = "mistral-test-key";

  global.fetch = async () =>
    createJsonResponse({
      choices: [
        {
          message: {
            content: [
              { type: "text", text: "First line." },
              { type: "text", text: "Second line." },
            ],
          },
        },
      ],
    });

  const summary = await summarizeWithMistral("Long note body");

  assert.equal(summary, "First line.\nSecond line.");
});

test("Mistral uses the default model when MISTRAL_MODEL is not set", async () => {
  process.env.MISTRAL_API_KEY = "mistral-test-key";
  delete process.env.MISTRAL_MODEL;

  let capturedRequest: RequestInit | undefined;

  global.fetch = async (_input, init) => {
    capturedRequest = init;

    return createJsonResponse({
      choices: [{ message: { content: "Mistral summary." } }],
    });
  };

  await summarizeWithMistral("Long note body");

  const parsedBody = JSON.parse(String(capturedRequest?.body));
  assert.equal(parsedBody.model, "mistral-small-latest");
});

test("Mistral surfaces a generic error for non-JSON failures", async () => {
  process.env.MISTRAL_API_KEY = "mistral-test-key";

  global.fetch = async () =>
    new Response("upstream failure", {
      status: 503,
    });

  await assert.rejects(
    () => summarizeWithMistral("Long note body"),
    (error: unknown) =>
      error instanceof AIProviderError &&
      error.provider === "Mistral" &&
      error.status === 503 &&
      error.message === "Mistral request failed with status 503"
  );
});

test("Provider chain returns Groq output when Groq succeeds", async () => {
  process.env.GROQ_API_KEY = "groq-test-key";
  process.env.MISTRAL_API_KEY = "mistral-test-key";

  let calls = 0;

  global.fetch = async () => {
    calls += 1;

    return createJsonResponse({
      choices: [{ message: { content: "Primary Groq summary." } }],
    });
  };

  const summary = await summarizeWithFallbackProviders("Long note body");

  assert.equal(summary, "Primary Groq summary.");
  assert.equal(calls, 1);
});

test("Provider chain falls back to Mistral when Groq is retryable", async () => {
  process.env.GROQ_API_KEY = "groq-test-key";
  process.env.MISTRAL_API_KEY = "mistral-test-key";

  let calls = 0;

  global.fetch = async (input) => {
    calls += 1;

    if (String(input).includes("api.groq.com")) {
      return createJsonResponse(
        {
          error: {
            message: "Groq rate limit exceeded.",
          },
        },
        429
      );
    }

    return createJsonResponse({
      choices: [{ message: { content: "Fallback Mistral summary." } }],
    });
  };

  const summary = await summarizeWithFallbackProviders("Long note body");

  assert.equal(summary, "Fallback Mistral summary.");
  assert.equal(calls, 2);
});

test("Provider chain does not fall back on non-retryable Groq errors", async () => {
  process.env.GROQ_API_KEY = "groq-test-key";
  process.env.MISTRAL_API_KEY = "mistral-test-key";

  global.fetch = async () =>
    createJsonResponse(
      {
        error: {
          message: "Invalid Groq API key.",
        },
      },
      401
    );

  await assert.rejects(
    () => summarizeWithFallbackProviders("Long note body"),
    (error: unknown) =>
      error instanceof AIProviderError &&
      error.provider === "Groq" &&
      error.status === 401 &&
      error.retryable === false
  );
});

test("createSummarizeResponse validates blank input", async () => {
  const result = await createSummarizeResponse("   ");

  assert.deepEqual(result, {
    body: { error: "Text content is required" },
    status: 400,
  });
});

test("createSummarizeResponse maps provider and unexpected errors correctly", async () => {
  const providerLimited = await createSummarizeResponse(
    "Long note body",
    async () => {
      throw new AIProviderError("Groq rate limit exceeded.", "Groq", 429, true);
    }
  );

  assert.deepEqual(providerLimited, {
    body: { error: "Groq rate limit exceeded." },
    status: 429,
  });

  const unexpectedFailure = await createSummarizeResponse(
    "Long note body",
    async () => {
      throw new Error("Unexpected summarizer failure");
    }
  );

  assert.deepEqual(unexpectedFailure, {
    body: { error: "Unexpected summarizer failure" },
    status: 500,
  });
});
