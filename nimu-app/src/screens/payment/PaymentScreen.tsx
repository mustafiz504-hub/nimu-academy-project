/**
 * PaymentScreen.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Real Razorpay payment — Expo Go compatible (no WebView native module needed).
 *
 * Flow:
 *  1. App creates Razorpay order via POST /api/payments/create-order
 *  2. expo-web-browser opens server's /checkout-page in a Safari/Chrome Custom Tab
 *  3. User pays via Razorpay inside the browser
 *  4. Razorpay calls handler → page redirects to nimucooking://razorpay-callback?...
 *  5. iOS/Android OS hands the deeplink back to the app → WebBrowser closes
 *  6. App parses params and POST /api/payments/verify → enrollment confirmed ✅
 *
 * Works in:  ✅ Expo Go   ✅ Custom Dev Build   ✅ Production APK/IPA
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";
import { paymentService } from "../../services/payment.service";
import { useCourseStore } from "../../store/course.store";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PaymentScreenProps {
  courseId: string;
  courseName: string;
  coursePrice: number;
  onSuccess: () => void;
  onClose: () => void;
}

type PaymentStep =
  | "confirm"
  | "loading"
  | "browser_open"
  | "verifying"
  | "success"
  | "failed";

// ─── Component ───────────────────────────────────────────────────────────────
export default function PaymentScreen({
  courseId,
  courseName,
  coursePrice,
  onSuccess,
  onClose,
}: PaymentScreenProps) {
  const { user, token } = useAuthStore();
  const { refreshMyEnrollments } = useCourseStore();

  const [step, setStep] = useState<PaymentStep>("confirm");
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");

  const checkAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  // ── Pulsing dots animation while browser is open ─────────────────────────
  useEffect(() => {
    if (step !== "browser_open") return;
    const anim = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dotAnim1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim1, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [step]);

  // ── Deep-link listener (fallback if openAuthSessionAsync doesn't catch it) ─
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.startsWith("nimucooking://razorpay-callback")) {
        handleCallback(url);
      }
    });
    return () => subscription.remove();
  }, [pendingOrderId]);

  // ── Parse callback URL and verify payment ────────────────────────────────
  const handleCallback = useCallback(
    async (callbackUrl: string) => {
      // Close browser if still open
      WebBrowser.dismissBrowser();

      const queryString = callbackUrl.includes("?")
        ? callbackUrl.split("?")[1]
        : "";
      const params: Record<string, string> = {};
      queryString.split("&").forEach((pair) => {
        const [k, v] = pair.split("=");
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
      });

      const status = params["status"];

      if (status === "success") {
        const razorpay_payment_id = params["payment_id"] || "";
        const razorpay_signature = params["signature"] || "";
        const razorpay_order_id = params["order_id"] || pendingOrderId;

        setStep("verifying");

        try {
          await paymentService.verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          });

          await refreshMyEnrollments();

          Animated.spring(checkAnim, {
            toValue: 1,
            tension: 60,
            friction: 5,
            useNativeDriver: true,
          }).start();

          setStep("success");
          setTimeout(() => onSuccess(), 2500);
        } catch (err: any) {
          setErrorMsg(
            err?.response?.data?.message || "Payment verification failed. Please contact support."
          );
          setStep("failed");
        }
      } else if (status === "cancelled") {
        setStep("confirm");
      } else {
        setErrorMsg(params["error"] || "Payment could not be completed.");
        setStep("failed");
      }
    },
    [pendingOrderId, refreshMyEnrollments, checkAnim, onSuccess]
  );

  // ── Initiate payment — create order + open browser ───────────────────────
  const handlePay = useCallback(async () => {
    if (!user || !token) return;

    try {
      setStep("loading");

      // 1. Create order on server
      const order = await paymentService.createOrder(courseId, {
        student_name: user.name,
        phone: (user as any).phone || "",
      });

      if (!order.success || !order.order_id) {
        throw new Error("Could not create payment order. Please try again.");
      }

      setPendingOrderId(order.order_id);

      // 2. Build checkout URL
      const checkoutUrl = paymentService.buildCheckoutUrl({
        order_id: order.order_id,
        amount: order.amount,
        course_id: courseId,
        course_name: order.course_name || courseName,
        user_name: order.user_name || user.name,
        user_email: order.user_email || (user as any).email || "",
        user_phone: order.user_phone || (user as any).phone || "",
        token,
      });

      setStep("browser_open");

      // 3. Open in Safari / Chrome Custom Tab — works in Expo Go!
      //    openAuthSessionAsync will redirect back to app on nimucooking:// deeplink
      const result = await WebBrowser.openAuthSessionAsync(
        checkoutUrl,
        "nimucooking://"
      );

      if (result.type === "success" && result.url) {
        // Browser returned via deeplink
        await handleCallback(result.url);
      } else if (result.type === "cancel" || result.type === "dismiss") {
        // User closed the browser
        setStep("confirm");
      }
      // If type === "locked" or other — do nothing, deeplink listener will handle
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Something went wrong."
      );
      setStep("failed");
    }
  }, [user, token, courseId, courseName, handleCallback]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Render helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const renderConfirm = () => (
    <View style={styles.sheetContent}>
      <View style={styles.handle} />

      {/* Icon */}
      <View style={styles.iconCircle}>
        <Ionicons name="card" size={36} color="#FF8C00" />
      </View>

      <Text style={styles.title}>Enroll in Course</Text>
      <Text style={styles.courseName} numberOfLines={2}>
        {courseName}
      </Text>

      {/* Price box */}
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Course Fee</Text>
          <Text style={styles.priceHint}>One-time payment · Lifetime access</Text>
        </View>
        <Text style={styles.price}>₹{coursePrice.toLocaleString("en-IN")}</Text>
      </View>

      <View style={styles.divider} />

      {/* Features */}
      <View style={styles.featureList}>
        {[
          { icon: "checkmark-circle", color: "#22C55E", text: "Lifetime access to all videos" },
          { icon: "checkmark-circle", color: "#22C55E", text: "Certificate of completion" },
          { icon: "checkmark-circle", color: "#22C55E", text: "Expert chef guidance" },
          { icon: "shield-checkmark", color: "#3B82F6", text: "Secure payment via Razorpay" },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name={f.icon as any} size={18} color={f.color} />
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Pay button */}
      <TouchableOpacity
        style={styles.payBtn}
        onPress={handlePay}
        activeOpacity={0.85}
      >
        <Ionicons name="lock-closed" size={16} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.payBtnText}>
          Pay ₹{coursePrice.toLocaleString("en-IN")} Securely
        </Text>
      </TouchableOpacity>

      {/* Razorpay badge */}
      <View style={styles.razorpayBadge}>
        <Ionicons name="shield-checkmark-outline" size={13} color="#64748B" />
        <Text style={styles.razorpayText}>Powered by Razorpay · 256-bit SSL</Text>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centeredContent}>
      <ActivityIndicator size="large" color="#FF8C00" />
      <Text style={styles.loadingText}>Creating secure order…</Text>
      <Text style={styles.loadingSubtext}>Please wait a moment</Text>
    </View>
  );

  const renderBrowserOpen = () => (
    <View style={styles.centeredContent}>
      {/* Animated dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.loadingText}>Payment browser is open</Text>
      <Text style={styles.loadingSubtext}>
        Complete your payment in the browser window
      </Text>

      <View style={styles.browserHintBox}>
        <Ionicons name="globe-outline" size={20} color="#FF8C00" style={{ marginBottom: 6 }} />
        <Text style={styles.browserHintText}>
          Razorpay secure checkout has opened in your browser.
          {"\n"}Come back here after completing payment.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.cancelBtnOutlined}
        onPress={() => {
          WebBrowser.dismissBrowser();
          setStep("confirm");
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelBtnOutlinedText}>Cancel Payment</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifying = () => (
    <View style={styles.centeredContent}>
      <ActivityIndicator size="large" color="#FF8C00" />
      <Text style={styles.loadingText}>Confirming payment…</Text>
      <Text style={styles.loadingSubtext}>Securing your enrollment</Text>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.centeredContent}>
      <Animated.View
        style={[
          styles.successCircle,
          {
            transform: [
              {
                scale: checkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
            opacity: checkAnim,
          },
        ]}
      >
        <Ionicons name="checkmark" size={52} color="#FFFFFF" />
      </Animated.View>
      <Text style={styles.successTitle}>Payment Successful! 🎉</Text>
      <Text style={styles.successSub}>You're now enrolled in</Text>
      <Text style={styles.successCourse} numberOfLines={2}>
        {courseName}
      </Text>
      <Text style={styles.successHint}>Redirecting to your course…</Text>
    </View>
  );

  const renderFailed = () => (
    <View style={styles.centeredContent}>
      <View style={styles.failCircle}>
        <Ionicons name="close" size={48} color="#FFFFFF" />
      </View>
      <Text style={styles.failTitle}>Payment Failed</Text>
      <Text style={styles.failSub}>
        {errorMsg || "Something went wrong. Please try again."}
      </Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() => setStep("confirm")}
        activeOpacity={0.85}
      >
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ marginTop: 12 }}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Layout ───────────────────────────────────────────────────────────────
  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (step === "success" || step === "verifying" || step === "browser_open") return;
        onClose();
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
        {step === "confirm" && renderConfirm()}
        {step === "loading" && renderLoading()}
        {step === "browser_open" && renderBrowserOpen()}
        {step === "verifying" && renderVerifying()}
        {step === "success" && renderSuccess()}
        {step === "failed" && renderFailed()}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1B18",
    marginBottom: 6,
  },
  courseName: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#FFF3E0",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFD08A",
  },
  priceLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "700",
  },
  priceHint: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FF8C00",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0E6D8",
    marginBottom: 20,
  },
  featureList: {
    width: "100%",
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  payBtn: {
    width: "100%",
    backgroundColor: "#FF8C00",
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 14,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  razorpayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 16,
  },
  razorpayText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  cancelBtn: {
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1B18",
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF8C00",
  },
  browserHintBox: {
    marginTop: 28,
    backgroundColor: "#FFF3E0",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD08A",
    width: "100%",
  },
  browserHintText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  cancelBtnOutlined: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelBtnOutlinedText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1E1B18",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: "#64748B",
  },
  successCourse: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF8C00",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  successHint: {
    fontSize: 12,
    color: "#94A3B8",
  },
  failCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  failTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1E1B18",
    marginBottom: 8,
  },
  failSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  retryBtn: {
    backgroundColor: "#FF8C00",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
