import { supabase } from './supabase';

export interface PaymentProvider {
  createCheckoutSession: (params: CreateCheckoutSessionParams) => Promise<CheckoutSession>;
  verifyPayment: (sessionId: string) => Promise<PaymentStatus>;
}

export interface CreateCheckoutSessionParams {
  courseId: string;
  price: number;
  title: string;
  userId: string;
}

export interface CheckoutSession {
  id: string;
  url?: string;
  payment_status: PaymentStatus;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

// Mock implementation of payment provider
class MockPaymentProvider implements PaymentProvider {
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
    // TODO: Replace with actual Stripe integration
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sessionId = `mock_session_${Math.random().toString(36).substring(7)}`;

    try {
      // Create purchase record in database
      const { error } = await supabase.from('course_purchases').insert({
        course_id: params.courseId,
        user_id: params.userId,
        amount_paid: params.price,
        payment_status: 'completed',
        payment_method: 'mock_payment',
        transaction_id: sessionId
      });

      if (error) throw error;

      return {
        id: sessionId,
        payment_status: 'completed'
      };
    } catch (error) {
      console.error('Error creating mock payment session:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentStatus> {
    // TODO: Replace with actual Stripe payment verification
    // In mock implementation, all payments are successful
    return 'completed';
  }
}

// Export singleton instance
export const paymentProvider = new MockPaymentProvider();