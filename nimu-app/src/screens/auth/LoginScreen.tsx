import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLoginInitiateMutation } from "../../hooks/useAuthMutations";
import type { LoginInitiateResponse } from "../../services/auth.service";

const { width } = Dimensions.get("window");

interface LoginScreenProps {
  onGoToRegister: () => void;
  /** Called when OTP has been sent — passes session info to parent for OTP screen */
  onOtpSent: (session: {
    identifier: string;
    maskedTarget: string;
    channel: "email" | "phone";
    purpose: "login";
  }) => void;
}

export default function LoginScreen({ onGoToRegister, onOtpSent }: LoginScreenProps) {
  const { mutateAsync: loginInitiate, loading, error } = useLoginInitiateMutation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, tension: 200, friction: 8 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();

  const handleRequestOtp = async () => {
    if (!email.trim() || !password.trim()) return;

    try {
      const res: LoginInitiateResponse = await loginInitiate({ email: email.trim(), password: password.trim() });
      
      onOtpSent({
        identifier: res.identifier || email.trim(),
        maskedTarget: res.maskedTarget || email.trim(),
        channel: res.channel || "email",
        purpose: "login",
      });
    } catch {
      // Error handled in hook
    }
  };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FDF8F0" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Hero Section ── */}
        <View style={{ alignItems: "center", paddingTop: 60, paddingBottom: 32, position: "relative", overflow: "hidden" }}>
          {/* Background blob */}
          <View
            style={{
              position: "absolute",
              top: -80,
              width: width * 1.2,
              height: width * 1.2,
              borderRadius: (width * 1.2) / 2,
              backgroundColor: "#FFF3E0",
              opacity: 0.8,
            }}
          />
          {/* Floating decorative dots */}
          <View style={{ position: "absolute", top: 40, left: 30, width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFA726", opacity: 0.5 }} />
          <View style={{ position: "absolute", top: 80, left: 60, width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF8C00", opacity: 0.4 }} />
          <View style={{ position: "absolute", top: 30, right: 40, width: 14, height: 14, borderRadius: 7, backgroundColor: "#FFB74D", opacity: 0.4 }} />
          <View style={{ position: "absolute", top: 90, right: 70, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFA726", opacity: 0.5 }} />

          {/* Logo */}
          <View
            style={{
              width: 100, height: 100, borderRadius: 50, backgroundColor: "#FFFFFF",
              justifyContent: "center", alignItems: "center", marginBottom: 16,
              shadowColor: "#FF8C00", shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
              overflow: "hidden", borderWidth: 2.5, borderColor: "#FF8C00",
            }}
          >
            <Image
              source={require("../../../assets/images/logo-round.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          </View>

          <Text style={{ fontSize: 26, fontWeight: "800", color: "#1E1B18", letterSpacing: -0.5 }}>
            Nimu Academy
          </Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 4, fontWeight: "500" }}>
            Your culinary journey starts here
          </Text>
        </View>

        {/* ── Card Form Section ── */}
        <View
          style={{
            flex: 1, backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 36, borderTopRightRadius: 36,
            padding: 28, paddingTop: 32,
            shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06, shadowRadius: 16, elevation: 8,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }}>
            Welcome Back 👋
          </Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", marginBottom: 28, fontWeight: "500" }}>
            Sign in with your email and password to receive a one-time code.
          </Text>

          {/* Email */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, letterSpacing: 0.3 }}>
            EMAIL ADDRESS
          </Text>
          <View
            style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: emailFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16, borderWidth: 1.5,
              borderColor: emailFocused ? "#FF8C00" : "#F0E6D8",
              paddingHorizontal: 16, marginBottom: 16, height: 56,
            }}
          >
            <Ionicons name="mail-outline" size={20} color={emailFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="email@example.com"
              placeholderTextColor="#CBD5E1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, letterSpacing: 0.3 }}>
            PASSWORD
          </Text>
          <View
            style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: passwordFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16, borderWidth: 1.5,
              borderColor: passwordFocused ? "#FF8C00" : "#F0E6D8",
              paddingHorizontal: 16, marginBottom: 24, height: 56,
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="Enter your password"
              placeholderTextColor="#CBD5E1"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onSubmitEditing={handleRequestOtp}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={{ backgroundColor: "#FFF0F0", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="alert-circle" size={16} color="#FF5252" />
              <Text style={{ fontSize: 12, color: "#FF5252", fontWeight: "600", flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {/* OTP Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleRequestOtp}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={loading || !canSubmit}
              activeOpacity={0.9}
              style={{
                height: 56, borderRadius: 18,
                backgroundColor: !canSubmit ? "#E2E8F0" : "#FF8C00",
                justifyContent: "center", alignItems: "center",
                shadowColor: "#FF8C00", shadowOffset: { width: 0, height: 6 },
                shadowOpacity: !canSubmit ? 0 : 0.35, shadowRadius: 12,
                elevation: !canSubmit ? 0 : 6,
                flexDirection: "row", gap: 10,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={18} color={!canSubmit ? "#94A3B8" : "#FFFFFF"} />
                  <Text style={{ color: !canSubmit ? "#94A3B8" : "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
                    Login securely
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Removed Toggle */}

          {/* Sign Up Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 28 }}>
            <Text style={{ fontSize: 14, color: "#64748B", fontWeight: "500" }}>Don't have an account?  </Text>
            <TouchableOpacity onPress={onGoToRegister} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, color: "#FF8C00", fontWeight: "800" }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
