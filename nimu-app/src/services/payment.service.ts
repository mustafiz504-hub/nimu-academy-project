import api from "./api";
import { ENDPOINTS } from "../constants/api";
import type { PaymentOrder, PaymentVerification, PaymentResult } from "../types/payment.types";

export const paymentService = {
  async createOrder(courseId: string, amount: number): Promise<PaymentOrder> {
    const { data } = await api.post<PaymentOrder>(ENDPOINTS.createOrder, { course_id: courseId, amount });
    return data;
  },

  async verifyPayment(payload: PaymentVerification): Promise<PaymentResult> {
    const { data } = await api.post<PaymentResult>(ENDPOINTS.verifyPayment, payload);
    return data;
  },
};
