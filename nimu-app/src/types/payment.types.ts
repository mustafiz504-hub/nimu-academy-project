export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
  course_id?: string;
  key_id?: string;
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
