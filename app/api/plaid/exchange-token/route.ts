import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { exchangePublicToken } from '@/lib/plaid';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { public_token } = await req.json();
    const { accessToken, itemId } = await exchangePublicToken(public_token);
    // In production: store accessToken + itemId in DB for this user
    console.log('Plaid item connected:', itemId, 'for user:', userId);
    return NextResponse.json({ success: true, itemId });
  } catch (error) {
    console.error('Exchange token error:', error);
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
  }
}
