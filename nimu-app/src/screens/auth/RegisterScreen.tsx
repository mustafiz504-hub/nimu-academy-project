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
import { useSignupInitiateMutation } from "../../hooks/useAuthMutations";

const { width } = Dimensions.get("window");

interface RegisterScreenProps {
  onGoToLogin: () => void;
  /** Called when OTP has been sent — passes email to parent for OTP screen */
  onSignupSuccess: (session: {
    email: string;
    maskedEmail: string;
    maskedPhone: string;
    purpose: "signup";
  }) => void;
}

export default function RegisterScreen({ onGoToLogin, onSignupSuccess }: RegisterScreenProps) {
  const { mutateAsync: signupInitiate, loading, error } = useSignupInitiateMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, tension: 200, friction: 8 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();

  const handleRegister = async () => {
    setLocalError(null);
    if (!name.trim()) return setLocalError("Please enter your full name.");
    if (!email.trim()) return setLocalError("Please enter your email address.");
    if (!password.trim() || password.length < 6) return setLocalError("Password must be at least 6 characters.");
    if (!termsAgreed) return setLocalError("Please agree to the Terms & Privacy Policy to continue.");

    try {
      const res = await signupInitiate({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        terms_agreed: termsAgreed,
        marketing_opt_in: marketingOptIn,
      });

      onSignupSuccess({
        email: res.email || email.trim(),
        maskedEmail: res.maskedEmail || email.trim(),
        maskedPhone: res.maskedPhone || "",
        purpose: "signup",
      });
    } catch {
      // Error handled in hook
    }
  };

  const displayError = localError || error;
  const canSubmit = name && email && password && termsAgreed;

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
        <View style={{ alignItems: "center", paddingTop: 50, paddingBottom: 24, position: "relative", overflow: "hidden" }}>
          <View
            style={{
              position: "absolute", top: -80,
              width: width * 1.2, height: width * 1.2,
              borderRadius: (width * 1.2) / 2,
              backgroundColor: "#FFF3E0", opacity: 0.8,
            }}
          />
          {/* Decorative dots */}
          <View style={{ position: "absolute", top: 35, left: 32, width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFA726", opacity: 0.5 }} />
          <View style={{ position: "absolute", top: 75, left: 65, width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF8C00", opacity: 0.4 }} />
          <View style={{ position: "absolute", top: 25, right: 42, width: 14, height: 14, borderRadius: 7, backgroundColor: "#FFB74D", opacity: 0.4 }} />

          {/* Logo */}
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
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E1B18", letterSpacing: -0.5 }}>Nimu Academy</Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 3, fontWeight: "500" }}>Your culinary journey starts here</Text>
        </View>

        {/* ── Card Form Section ── */}
        <View
          style={{
            flex: 1, backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 36, borderTopRightRadius: 36,
            padding: 28, paddingTop: 30,
            shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06, shadowRadius: 16, elevation: 8,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }}>
            Create Account ✨
          </Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24, fontWeight: "500" }}>
            Join thousands of learners today
          </Text>

          {/* Full Name */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, letterSpacing: 0.3 }}>
            FULL NAME
          </Text>
          <View
            style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: nameFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16, borderWidth: 1.5,
              borderColor: nameFocused ? "#FF8C00" : "#F0E6D8",
              paddingHorizontal: 16, marginBottom: 18, height: 56,
            }}
          >
            <Ionicons name="person-outline" size={20} color={nameFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="Muskan Naz"
              placeholderTextColor="#CBD5E1"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>

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
              paddingHorizontal: 16, marginBottom: 18, height: 56,
            }}
          >
            <Ionicons name="mail-outline" size={20} color={emailFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="chef@example.com"
              placeholderTextColor="#CBD5E1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
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
              paddingHorizontal: 16, marginBottom: 18, height: 56,
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="Set a password (min 6 chars)"
              placeholderTextColor="#CBD5E1"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Checkboxes */}
          {/* Terms */}
          <TouchableOpacity
            onPress={() => setTermsAgreed(!termsAgreed)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 }}
          >
            <View
              style={{
                width: 22, height: 22, borderRadius: 6, marginTop: 1,
                borderWidth: 2,
                borderColor: termsAgreed ? "#FF8C00" : "#CBD5E1",
                backgroundColor: termsAgreed ? "#FF8C00" : "#FFFFFF",
                justifyContent: "center", alignItems: "center", flexShrink: 0,
              }}
            >
              {termsAgreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={{ fontSize: 12, color: "#64748B", flex: 1, lineHeight: 18 }}>
              I have read and agree to the{" "}
              <Text style={{ color: "#FF8C00", fontWeight: "700" }}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={{ color: "#FF8C00", fontWeight: "700" }}>Privacy Policy</Text>
              <Text style={{ color: "#EF4444" }}> *</Text>
            </Text>
          </TouchableOpacity>

          {/* Marketing */}
          <TouchableOpacity
            onPress={() => setMarketingOptIn(!marketingOptIn)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 20 }}
          >
            <View
              style={{
                width: 22, height: 22, borderRadius: 6, marginTop: 1,
                borderWidth: 2,
                borderColor: marketingOptIn ? "#FF8C00" : "#CBD5E1",
                backgroundColor: marketingOptIn ? "#FF8C00" : "#FFFFFF",
                justifyContent: "center", alignItems: "center", flexShrink: 0,
              }}
            >
              {marketingOptIn && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={{ fontSize: 12, color: "#94A3B8", flex: 1, lineHeight: 18 }}>
              I agree to receive course updates, offers and announcements from Nimu Academy.
            </Text>
          </TouchableOpacity>

          {/* Error */}
          {displayError ? (
            <View style={{ backgroundColor: "#FFF0F0", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="alert-circle" size={16} color="#FF5252" />
              <Text style={{ fontSize: 12, color: "#FF5252", fontWeight: "600", flex: 1 }}>{displayError}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleRegister}
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
                  <Ionicons name="rocket-outline" size={18} color={!canSubmit ? "#94A3B8" : "#FFFFFF"} />
                  <Text style={{ color: !canSubmit ? "#94A3B8" : "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
                    Get Started
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Login Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: "#64748B", fontWeight: "500" }}>Already have an account?  </Text>
            <TouchableOpacity onPress={onGoToLogin} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, color: "#FF8C00", fontWeight: "800" }}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
