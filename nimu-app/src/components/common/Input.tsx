import React from "react";
import { TextInput, View, Text } from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  error?: string;
}

export default function Input({ label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = "default", error }: InputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>{label}</Text>}
      <TextInput
        style={{
          height: 52,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          paddingHorizontal: 16,
          fontSize: 14,
          color: "#1E1B18",
          borderWidth: 1,
          borderColor: error ? "#FF5252" : "#F0E6D8",
        }}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
      />
      {error && <Text style={{ fontSize: 11, color: "#FF5252", marginTop: 4 }}>{error}</Text>}
    </View>
  );
}
