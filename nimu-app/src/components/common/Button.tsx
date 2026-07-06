import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({ title, onPress, loading = false, disabled = false, variant = "primary" }: ButtonProps) {
  const bgColor = variant === "primary" ? COLORS.primary : variant === "secondary" ? COLORS.secondary : "transparent";
  const textColor = variant === "outline" ? COLORS.primary : "#FFFFFF";
  const borderColor = variant === "outline" ? COLORS.primary : "transparent";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        backgroundColor: disabled ? "#E2E8F0" : bgColor,
        borderWidth: variant === "outline" ? 1.5 : 0,
        borderColor,
        borderRadius: 16,
        height: 52,
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: disabled ? "#94A3B8" : textColor, fontSize: 15, fontWeight: "700" }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
