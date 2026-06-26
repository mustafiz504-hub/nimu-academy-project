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
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface RegisterScreenProps {
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, tension: 200, friction: 8 }).start();
  const pressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();

  // Password strength helper
  const getPasswordStrength = (p: string): { label: string; color: string; width: string } => {
    if (p.length === 0) return { label: "", color: "#E2E8F0", width: "0%" };
    if (p.length < 6) return { label: "Weak", color: "#FF5252", width: "30%" };
    if (p.length < 10) return { label: "Fair", color: "#FFA726", width: "60%" };
    return { label: "Strong", color: "#4CAF50", width: "100%" };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async () => {
    setLocalError(null);
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch {
      // handled in hook
    }
  };

  const displayError = localError || error;
  const canSubmit = name && email && password && confirmPassword;

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
        <View style={{ alignItems: "center", paddingTop: 50, paddingBottom: 28, position: "relative", overflow: "hidden" }}>
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
          <View style={{ position: "absolute", top: 35, left: 32, width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFA726", opacity: 0.5 }} />
          <View style={{ position: "absolute", top: 75, left: 65, width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF8C00", opacity: 0.4 }} />
          <View style={{ position: "absolute", top: 25, right: 42, width: 14, height: 14, borderRadius: 7, backgroundColor: "#FFB74D", opacity: 0.4 }} />
          <View style={{ position: "absolute", top: 85, right: 72, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFA726", opacity: 0.5 }} />

          {/* Logo circle */}
          <View
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              backgroundColor: "#FF8C00",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 14,
              shadowColor: "#FF8C00",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 38 }}>🍳</Text>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E1B18", letterSpacing: -0.5 }}>
            Nimu Academy
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 3, fontWeight: "500" }}>
            Your culinary journey starts here
          </Text>
        </View>

        {/* ── Card Form Section ── */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            padding: 28,
            paddingTop: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 8,
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
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: nameFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: nameFocused ? "#FF8C00" : "#F0E6D8",
              paddingHorizontal: 16,
              marginBottom: 18,
              height: 56,
            }}
          >
            <Ionicons name="person-outline" size={20} color={nameFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="John Doe"
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
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: emailFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: emailFocused ? "#FF8C00" : "#F0E6D8",
              paddingHorizontal: 16,
              marginBottom: 18,
              height: 56,
            }}
          >
            <Ionicons name="mail-outline" size={20} color={emailFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="you@example.com"
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
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: passwordFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: passwordFocused ? "#FF8C00" : "#F0E6D8",
              paddingHorizontal: 16,
              marginBottom: password.length > 0 ? 8 : 18,
              height: 56,
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? "#FF8C00" : "#94A3B8"} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="Min. 6 characters"
              placeholderTextColor="#CBD5E1"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <View style={{ marginBottom: 18 }}>
              <View style={{ height: 4, backgroundColor: "#F0E6D8", borderRadius: 2, overflow: "hidden" }}>
                <View style={{ height: "100%", width: strength.width as any, backgroundColor: strength.color, borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "700", color: strength.color, marginTop: 4 }}>
                {strength.label} password
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, letterSpacing: 0.3 }}>
            CONFIRM PASSWORD
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: confirmFocused ? "#FFFBF5" : "#F8F9FA",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor:
                confirmPassword.length > 0 && confirmPassword !== password
                  ? "#FF5252"
                  : confirmFocused
                  ? "#FF8C00"
                  : "#F0E6D8",
              paddingHorizontal: 16,
              marginBottom: 20,
              height: 56,
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={
                confirmPassword.length > 0 && confirmPassword !== password
                  ? "#FF5252"
                  : confirmFocused
                  ? "#FF8C00"
                  : "#94A3B8"
              }
            />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#1E1B18", fontWeight: "500" }}
              placeholder="Re-enter password"
              placeholderTextColor="#CBD5E1"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {confirmPassword.length > 0 && (
                <Ionicons
                  name={confirmPassword === password ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={confirmPassword === password ? "#4CAF50" : "#FF5252"}
                />
              )}
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7}>
                <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {displayError ? (
            <View style={{ backgroundColor: "#FFF0F0", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="alert-circle" size={16} color="#FF5252" />
              <Text style={{ fontSize: 12, color: "#FF5252", fontWeight: "600", flex: 1 }}>{displayError}</Text>
            </View>
          ) : null}

          {/* Terms text */}
          <Text style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginBottom: 16, lineHeight: 16 }}>
            By signing up, you agree to our{" "}
            <Text style={{ color: "#FF8C00", fontWeight: "700" }}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={{ color: "#FF8C00", fontWeight: "700" }}>Privacy Policy</Text>
          </Text>

          {/* Register Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleRegister}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={loading || !canSubmit}
              activeOpacity={0.9}
              style={{
                height: 56,
                borderRadius: 18,
                backgroundColor: !canSubmit ? "#E2E8F0" : "#FF8C00",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#FF8C00",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: !canSubmit ? 0 : 0.35,
                shadowRadius: 12,
                elevation: !canSubmit ? 0 : 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: !canSubmit ? "#94A3B8" : "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
                  Create Account
                </Text>
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

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
