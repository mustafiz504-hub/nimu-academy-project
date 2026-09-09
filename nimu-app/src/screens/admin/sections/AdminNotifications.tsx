import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminService } from "../../../services/admin.service";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Validation Error", "Please provide both title and body for the notification.");
      return;
    }

    try {
      setLoading(true);
      await adminService.sendPushNotification(title, body);
      Alert.alert("Success", "Push notification sent successfully to all users.");
      setTitle("");
      setBody("");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
      <View style={{ backgroundColor: "#FFFFFF", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#F0E6D8", shadowColor: "#1E1B18", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}>
        
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="notifications" size={20} color="#10B981" />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18" }}>Broadcast Message</Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Send a push notification to all users</Text>
          </View>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6 }}>Notification Title</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 48 }}>
              <Ionicons name="text-outline" size={18} color="#94A3B8" />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Special Offer!"
                style={{ flex: 1, marginLeft: 10, fontSize: 14, color: "#1E1B18" }}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6 }}>Notification Body</Text>
            <View style={{ backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, paddingTop: 12, height: 100 }}>
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Type your message here..."
                multiline
                textAlignVertical="top"
                style={{ flex: 1, fontSize: 14, color: "#1E1B18" }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            style={{ backgroundColor: "#10B981", height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8, marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="send" size={18} color="#FFFFFF" />}
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
              {loading ? "Sending..." : "Send Broadcast"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
