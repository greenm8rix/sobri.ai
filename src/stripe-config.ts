/**
 * Stripe product configuration
 * 
 * This file contains the configuration for the Stripe products used in the application.
 * Each product must include priceId, name, description, and mode properties.
 */

export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price?: string;
  currency?: string;
}

export const PRODUCTS: StripeProduct[] = [
  {
    priceId: 'price_1RUSroFdhzZhnmSKP5fbkOjR',
    name: 'Soberi.ai',
    description: 'If you wish to cancel your subscription, please email us at exaliodevelopment@gmail.com. We will refund the amount corresponding to any unused tokens.',
    mode: 'subscription',
    price: '20.00',
    currency: 'EUR'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return PRODUCTS.find(product => product.priceId === priceId);
};