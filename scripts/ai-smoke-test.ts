import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  summarizeWithFallbackProviders,
  summarizeWithGroq,
  summarizeWithMistral,
} from "../lib/ai/providers.ts";

const sampleText = `
Smart Notes helps users capture notes, summarize long content, and organize ideas.
The app uses Next.js for the frontend, Supabase for authentication and storage,
and AI models to generate concise summaries for saved notes.
`.trim();

function loadEnvFile(fileName: string) {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const fileContents = readFileSync(filePath, "utf8");

  for (const line of fileContents.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const groqSummary = await summarizeWithGroq(sampleText);
  console.log("Groq smoke test passed.");
  console.log(groqSummary);
  console.log("");

  const mistralSummary = await summarizeWithMistral(sampleText);
  console.log("Mistral smoke test passed.");
  console.log(mistralSummary);
  console.log("");

  const chainSummary = await summarizeWithFallbackProviders(sampleText);
  console.log("Provider-chain smoke test passed.");
  console.log(chainSummary);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("AI smoke test failed:");
  console.error(message);
  process.exit(1);
});
