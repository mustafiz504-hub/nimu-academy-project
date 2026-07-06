import React from "react";
import { View, Text } from "react-native";
import { COLORS } from "../../constants/colors";

type BadgeVariant = "primary" | "success" | "info" | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: COLORS.primaryBg, text: COLORS.primary },
  success: { bg: "#E8F5E9", text: "#2E7D32" },
  info: { bg: "#E1F5FE", text: "#01579B" },
  muted: { bg: "#F1F5F9", text: "#64748B" },
};

export default function Badge({ label, variant = "muted" }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <View style={{ backgroundColor: style.bg, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 }}>
      <Text style={{ fontSize: 10, color: style.text, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
