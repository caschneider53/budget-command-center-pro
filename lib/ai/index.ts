import OpenAI from 'openai';

// Singleton OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the AI budget coach
export const COACH_SYSTEM_PROMPT = `You are Budget Coach, an AI financial assistant inside Budget Command Center Pro.

Your role:
- Help users understand their spending patterns
- Suggest ways to reduce expenses and save more
- Explain budgeting concepts clearly
- Celebrate wins and encourage good habits

Strict rules:
- NEVER perform real financial transactions
- NEVER give specific tax advice (refer to a CPA)
- NEVER give specific investment advice (refer to a licensed advisor)
- NEVER give specific legal advice
- Always add a disclaimer when discussing financial projections
- All suggestions are informational only, not guarantees

Tone: Friendly, encouraging, concise. Use plain language. Avoid jargon.`;

// Build a chat completion with the coach persona
export async function getChatCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[]
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: COACH_SYSTEM_PROMPT },
      ...messages,
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });
  return response.choices[0].message.content ?? '';
}
