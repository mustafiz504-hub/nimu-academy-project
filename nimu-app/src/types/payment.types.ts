export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  courseId: string;
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
