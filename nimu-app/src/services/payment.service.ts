import api from "./api";
import { ENDPOINTS } from "../constants/api";
import { API_BASE_URL } from "../constants/api";
import type { PaymentOrder, PaymentVerification, PaymentResult } from "../types/payment.types";

export interface EnrollmentData {
  student_name?: string;
  phone?: string;
  city?: string;
  batch_timing?: string;
  mode?: string;
  message?: string;
}

export const paymentService = {
  /** Create Razorpay order and get order details from server */
  async createOrder(
    courseId: string,
    enrollmentData?: EnrollmentData
  ): Promise<PaymentOrder> {
    const { data } = await api.post<PaymentOrder>(ENDPOINTS.createOrder, {
      course_id: courseId,
      enrollmentData: enrollmentData || {},
    });
    return data;
  },

  /** Verify payment signature on server and confirm enrollment */
  async verifyPayment(payload: PaymentVerification): Promise<PaymentResult> {
    const { data } = await api.post<PaymentResult>(ENDPOINTS.verifyPayment, payload);
    return data;
  },

  /** Build the checkout page URL to load in WebView */
  buildCheckoutUrl(params: {
    order_id: string;
    amount: number;
    course_id: string;
    course_name: string;
    user_name: string;
    user_email: string;
    user_phone?: string;
    token: string;
  }): string {
    const base = API_BASE_URL.replace(/\/api$/, "");
    const redirectUrl = "nimucooking://razorpay-callback";

    const qs = new URLSearchParams({
      order_id: params.order_id,
      amount: String(params.amount),
      course_id: params.course_id,
      course_name: params.course_name,
      user_name: params.user_name,
      user_email: params.user_email,
      user_phone: params.user_phone || "",
      redirect_url: redirectUrl,
      token: params.token,
    });

    return `${base}/api/payments/checkout-page?${qs.toString()}`;
  },
};
