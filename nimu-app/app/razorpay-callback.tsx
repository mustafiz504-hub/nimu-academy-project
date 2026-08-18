import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { paymentService } from "../src/services/payment.service";
import { useCourseStore } from "../src/store/course.store";

export default function RazorpayCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: string;
    order_id?: string;
    payment_id?: string;
    signature?: string;
    course_id?: string;
    error?: string;
  }>();

  const { fetchMyEnrollments, setSelectedCourseId } = useCourseStore();
  const processed = useRef(false);
  const [loadingText, setLoadingText] = useState("Processing Payment...");

  useEffect(() => {
    // Prevent instant-bounce: Expo Router deep links often render initially with empty params.
    if (!params.status && !params.error && !params.course_id && !params.order_id) {
      return;
    }

    if (processed.current) return;
    processed.current = true;

    async function processCallback() {
      const { status, order_id, payment_id, signature, course_id } = params;

      if (course_id) {
        setSelectedCourseId(course_id);
      }

      if (status === "success") {
        setLoadingText("Unlocking your course...");
        if (order_id && payment_id) {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: order_id,
              razorpay_payment_id: payment_id,
              razorpay_signature: signature || "",
            });
          } catch (err: any) {
            console.error("Verification error in callback route:", err);
          }
        }
      } else {
        setLoadingText("Payment Failed or Cancelled");
      }

      await fetchMyEnrollments();

      // Smooth delay so the user clearly sees the success unlocking message before redirecting
      setTimeout(() => {
        router.replace("/");
      }, 1200);
    }

    processCallback();
  }, [params]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <ActivityIndicator size="large" color="#FF8C00" />
      <Text style={{ marginTop: 24, fontSize: 18, fontWeight: "700", color: "#1E1B18" }}>
        {loadingText}
      </Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: "#94A3B8" }}>
        Please wait, returning to Nimu Academy...
      </Text>
    </View>
  );
}
