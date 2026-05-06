import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getChatCompletion } from '@/lib/ai';
import { rateLimit, sanitizeInput } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 20 messages per minute per user
  if (!rateLimit(`ai:${userId}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Sanitize latest user message
    const sanitized = messages.map((m: { role: string; content: string }) => ({
      ...m,
      content: m.role === 'user' ? sanitizeInput(m.content) : m.content,
    }));

    const reply = await getChatCompletion(sanitized);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
