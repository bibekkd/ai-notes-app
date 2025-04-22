import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{
          parts: [{
            text: `Summarize the following text in a concise way (max 150 words): ${text}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY
        },
        params: {
          'key': process.env.NEXT_PUBLIC_GEMINI_API_KEY
        }
      }
    );
    
    const summary = response.data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Summarization error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to summarize text' },
      { status: 500 }
    );
  }
}