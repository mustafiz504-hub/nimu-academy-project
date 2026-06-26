import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: "#FDF8F0" }}>
      <View style={{ backgroundColor: "#FFF3E0", borderRadius: 24, padding: 32, alignItems: "center", width: "100%" }}>
        <Ionicons name="card-outline" size={56} color="#FFA726" />
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E1B18", marginTop: 16 }}>Payment</Text>
        <Text style={{ fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 8, marginBottom: 24, lineHeight: 20 }}>
          Razorpay integration ready. Connect to paymentService and openRazorpayCheckout utility.
        </Text>
        <TouchableOpacity style={{ backgroundColor: "#FF8C00", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16 }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
