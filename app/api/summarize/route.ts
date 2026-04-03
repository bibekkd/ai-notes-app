import { NextResponse } from "next/server";

import { createSummarizeResponse } from "@/lib/ai/summarize-service";

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text?: string };
  const result = await createSummarizeResponse(text);

  if ("error" in result.body) {
    console.error("Summarization error:", result.body.error);
  }

  return NextResponse.json(result.body, { status: result.status });
}
