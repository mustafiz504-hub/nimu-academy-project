import { Alert } from "react-native";
import type { PaymentOrder, PaymentVerification } from "../types/payment.types";

/**
 * Opens the Razorpay checkout sheet.
 * NOTE: Install react-native-razorpay when going to production.
 * Currently shows a placeholder for development.
 */
export async function openRazorpayCheckout(
  order: PaymentOrder,
  userEmail: string,
  userName: string,
  onSuccess: (data: PaymentVerification) => void,
  onFailure: (error: any) => void
): Promise<void> {
  // TODO: Replace with actual Razorpay SDK integration
  // import RazorpayCheckout from 'react-native-razorpay';
  // const options = {
  //   description: 'Course Payment',
  //   currency: order.currency,
  //   key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
  //   amount: order.amount,
  //   order_id: order.orderId,
  //   name: 'Nimu Academy',
  //   prefill: { email: userEmail, name: userName },
  //   theme: { color: '#FF8C00' }
  // };
  // RazorpayCheckout.open(options).then(onSuccess).catch(onFailure);

  Alert.alert(
    "Payment (Dev Mode)",
    `Order ID: ${order.orderId}\nAmount: ₹${order.amount / 100}`,
    [
      { text: "Cancel", style: "cancel", onPress: () => onFailure(new Error("Cancelled")) },
      {
        text: "Simulate Payment",
        onPress: () =>
          onSuccess({
            razorpay_order_id: order.orderId,
            razorpay_payment_id: "pay_dev_" + Date.now(),
            razorpay_signature: "sig_dev_mock",
          }),
      },
    ]
  );
}
