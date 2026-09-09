export interface PaymentOrder {
  success: boolean;
  order_id: string;
  amount: number;        // in paise
  currency: string;
  key_id: string;
  course_name: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  enrollmentId?: string;
}
