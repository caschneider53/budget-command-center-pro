import Stripe from 'stripe';

// Singleton Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Pricing tier price IDs (set these in Stripe dashboard)
export const PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER!, // $7/mo
  pro: process.env.STRIPE_PRICE_PRO!,         // $15/mo
  family: process.env.STRIPE_PRICE_FAMILY!,   // $24/mo
};

// Create a Stripe Checkout session for subscriptions
export async function createCheckoutSession({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
  });
  return session;
}

// Create a customer portal session to manage billing
export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
