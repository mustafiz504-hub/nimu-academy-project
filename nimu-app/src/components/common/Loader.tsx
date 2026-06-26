import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { COLORS } from "../../constants/colors";

interface LoaderProps {
  message?: string;
}

export default function Loader({ message }: LoaderProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FDF8F0" }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={{ marginTop: 12, fontSize: 13, color: "#64748B", fontWeight: "600" }}>{message}</Text>}
    </View>
  );
}
