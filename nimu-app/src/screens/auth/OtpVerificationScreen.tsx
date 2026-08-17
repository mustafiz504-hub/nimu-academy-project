import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  useSignupVerifyMutation,
  useLoginVerifyMutation,
  useResendOtpMutation,
} from "../../hooks/useAuthMutations";

interface OtpVerificationScreenProps {
  /** The identifier used to send the OTP (email for signup; email or phone for login) */
  identifier: string;
  /** Masked version of the target for display, e.g. "j***@gmail.com" or "+91 98***210" */
  maskedTarget: string;
  /** Whether OTP was sent for signup or login */
  purpose: "signup" | "login";
  /** Optional: go back to form */
  onGoBack: () => void;
}

export default function OtpVerificationScreen({
  identifier,
  maskedTarget,
  purpose,
  onGoBack,
}: OtpVerificationScreenProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { mutateAsync: signupVerify, loading: isSignupVerifying, error: signupVerifyError } = useSignupVerifyMutation();
  const { mutateAsync: loginVerify, loading: isLoginVerifying, error: loginVerifyError } = useLoginVerifyMutation();
  const { mutateAsync: resendOtp, loading: isResending, error: resendError } = useResendOtpMutation();

  const isVerifying = isSignupVerifying || isLoginVerifying;
  const verifyError = signupVerifyError || loginVerifyError;

  // 60-second countdown timer
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    // Handle paste of 6 digits
    if (text.length > 1) {
      const digits = text.replace(/[^0-9]/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (i < 6) newOtp[i] = d; });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) return;

    try {
      if (purpose === "signup") {
        await signupVerify({ email: identifier, otp: fullOtp });
      } else {
        await loginVerify({ identifier, otp: fullOtp });
      }
      // On success, auth store is updated → app transitions to Home automatically
    } catch {
      // Error handled by hook — clear OTP so user can re-enter
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending || resendCount >= 3) return;
    try {
      setResendMessage(null);
      await resendOtp({ identifier, purpose });
      setResendCount((c) => c + 1);
      setResendMessage("A new 6-digit OTP code has been sent!");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      // Error handled by hook
    }
  };

  const isComplete = otp.every((d) => d !== "");

  const targetDescription = maskedTarget;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FDF8F0" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ paddingTop: 50, paddingHorizontal: 24, paddingBottom: 20 }}>
          <TouchableOpacity
            onPress={onGoBack}
            style={{
              width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
              justifyContent: "center", alignItems: "center", marginBottom: 16,
              borderWidth: 1, borderColor: "#F0E6D8",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1E1B18" />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 88, height: 88, borderRadius: 44, backgroundColor: "#FFFFFF",
                justifyContent: "center", alignItems: "center", marginBottom: 14,
                shadowColor: "#FF8C00", shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
                overflow: "hidden", borderWidth: 2, borderColor: "#FF8C00",
              }}
            >
              <Image
                source={require("../../../assets/images/logo-round.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E1B18", letterSpacing: -0.5 }}>
              {purpose === "signup" ? "Verify Your Account" : "Enter Login Code"}
            </Text>
            <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4, textAlign: "center" }}>
              We sent a 6-digit code to{"\n"}
              <Text style={{ fontWeight: "700", color: "#FF8C00" }}>{targetDescription}</Text>
            </Text>
          </View>
        </View>

        {/* Card Form */}
        <View
          style={{
            flex: 1, backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 36, borderTopRightRadius: 36,
            padding: 28, paddingTop: 32,
            shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05, shadowRadius: 16, elevation: 8,
          }}
        >
          {/* Error Banners */}
          {(verifyError || resendError) && (
            <View
              style={{
                backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1,
                borderRadius: 14, padding: 12, marginBottom: 20,
                flexDirection: "row", alignItems: "center", gap: 8,
              }}
            >
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={{ color: "#DC2626", fontSize: 13, flex: 1, fontWeight: "500" }}>
                {verifyError || resendError}
              </Text>
            </View>
          )}

          {resendMessage && (
            <View
              style={{
                backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", borderWidth: 1,
                borderRadius: 14, padding: 12, marginBottom: 20,
                flexDirection: "row", alignItems: "center", gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={{ color: "#15803D", fontSize: 13, flex: 1, fontWeight: "500" }}>
                {resendMessage}
              </Text>
            </View>
          )}

          {/* 6 OTP Input Boxes */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 12, letterSpacing: 0.5 }}>
            ENTER 6-DIGIT OTP
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                value={digit}
                onChangeText={(text) => handleChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={idx === 0 ? 6 : 1}
                selectTextOnFocus
                style={{
                  width: 46, height: 56, borderRadius: 14, borderWidth: 2,
                  borderColor: digit ? "#FF8C00" : "#E2E8F0",
                  backgroundColor: digit ? "#FFF3E0" : "#F8FAFC",
                  textAlign: "center", fontSize: 22, fontWeight: "800", color: "#1E1B18",
                }}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={!isComplete || isVerifying}
            style={{
              backgroundColor: isComplete ? "#FF8C00" : "#CBD5E1",
              borderRadius: 16, height: 54,
              justifyContent: "center", alignItems: "center",
              shadowColor: isComplete ? "#FF8C00" : "transparent",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12,
              elevation: isComplete ? 6 : 0,
              marginBottom: 20,
              flexDirection: "row", gap: 8,
            }}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                  {purpose === "signup" ? "Verify & Create Account" : "Verify & Sign In"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            {resendCount >= 3 ? (
              <Text style={{ fontSize: 13, color: "#94A3B8" }}>
                Maximum resends reached. Please go back and try again.
              </Text>
            ) : canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text style={{ fontSize: 14, color: "#FF8C00", fontWeight: "700" }}>
                  {isResending ? "Sending..." : "Didn't receive code? Resend OTP"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 13, color: "#94A3B8" }}>
                Resend OTP in <Text style={{ fontWeight: "700", color: "#FF8C00" }}>{timer}s</Text>
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
