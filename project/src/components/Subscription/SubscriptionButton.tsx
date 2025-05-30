import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { PRODUCTS, StripeProduct } from '../../stripe-config';
import { createCheckoutSession } from '../../utils/stripeUtils';
import { RefreshCw } from 'lucide-react';

interface SubscriptionButtonProps {
  product?: StripeProduct;
  className?: string;
  buttonText?: string;
  showPrice?: boolean;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ 
  product = PRODUCTS[0],
  className = '',
  buttonText = 'Subscribe Now',
  showPrice = true
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login page if not logged in
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLoading(true);
    try {
      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
        successUrl: `${window.location.origin}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
      });

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 ${className}`}
    >
      {isLoading ? (
        <>
          <RefreshCw size={18} className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {buttonText}
          {showPrice && product.price && (
            <span className="ml-2">
              {product.price} {product.currency}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default SubscriptionButton;