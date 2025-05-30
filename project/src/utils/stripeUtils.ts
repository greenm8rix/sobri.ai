import { supabase } from './supabaseClient';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResponse {
  sessionId?: string;
  url?: string;
  error?: string;
}

/**
 * Creates a Stripe checkout session
 */
export async function createCheckoutSession({
  priceId,
  mode,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<CheckoutResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        price_id: priceId,
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(error.message);
    }

    if (!data || !data.sessionId || !data.url) {
      throw new Error('Invalid response from checkout endpoint');
    }

    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { error: error.message };
  }
}

/**
 * Checks if the current user has an active subscription
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('subscription_status')
      .maybeSingle();

    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }

    return data?.subscription_status === 'active';
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}