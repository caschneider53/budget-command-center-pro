import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed for user:', session.metadata?.userId);
      break;
    }
    case 'customer.subscription.deleted':
      console.log('Subscription cancelled:', (event.data.object as Stripe.Subscription).id);
      break;
    default:
      console.log('Unhandled Stripe event:', event.type);
  }
  return NextResponse.json({ received: true });
}
