import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { getProductByPriceId } from '../../stripe-config';
import { format } from 'date-fns';

interface SubscriptionData {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-medium">Error loading subscription</h3>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!subscription || !subscription.subscription_id || subscription.subscription_status !== 'active') {
    return (
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-amber-800 font-medium">No active subscription</h3>
        <p className="text-amber-700 text-sm">
          You don't have an active subscription. Subscribe to access premium features.
        </p>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : undefined;
  const renewalDate = subscription.current_period_end 
    ? format(new Date(subscription.current_period_end * 1000), 'MMMM d, yyyy')
    : 'Unknown';

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-green-800 font-medium">
        Active Subscription: {product?.name || 'Premium Plan'}
      </h3>
      <div className="mt-2 text-green-700 text-sm">
        <p>Status: <span className="font-medium">Active</span></p>
        <p>Renews on: {renewalDate}</p>
        {subscription.cancel_at_period_end && (
          <p className="text-amber-700 mt-1">
            Your subscription will end on {renewalDate}
          </p>
        )}
        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <p className="mt-1">
            Payment method: {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;