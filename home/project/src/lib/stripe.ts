import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is missing. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.');
}

export const stripePromise = loadStripe(stripePublishableKey || '');

interface CreateCheckoutSessionParams {
  courseId: string;
  price: number;
  title: string;
  userId: string;
}

export const createCheckoutSession = async ({ courseId, price, title, userId }: CreateCheckoutSessionParams) => {
  try {
    // For demo purposes, simulate a successful purchase without Stripe
    // In production, this would make a call to your backend to create a Stripe session
    const session = {
      id: `demo_${Math.random().toString(36).substring(7)}`,
      payment_status: 'completed'
    };

    // Create a purchase record
    const { error } = await supabase.from('course_purchases').insert({
      course_id: courseId,
      user_id: userId,
      amount_paid: price,
      payment_status: 'completed',
      payment_method: 'card',
      transaction_id: session.id
    });

    if (error) throw error;

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};