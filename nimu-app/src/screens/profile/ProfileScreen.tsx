import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
      {/* Profile Card */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 24 }}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" }}
          style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#FFA726", marginBottom: 12 }}
        />
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18" }}>
          {user?.name ?? "Student"}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
          {user?.email ?? ""}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16 }}>
          {[
            { label: "Courses", value: "12" },
            { label: "Avg Progress", value: "87%" },
            { label: "Certificates", value: "4" },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Account Settings */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18", marginBottom: 14 }}>Account Settings</Text>
      <View style={{ gap: 12 }}>
        {[
          { icon: "person-circle-outline", text: "Edit Profile Information" },
          { icon: "notifications-outline", text: "Notification Preferences" },
          { icon: "shield-checkmark-outline", text: "Security & Privacy" },
        ].map((setting, idx) => (
          <TouchableOpacity
            key={idx}
            style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Ionicons name={setting.icon as any} size={22} color="#FFA726" />
              <Text style={{ fontSize: 13, color: "#1E1B18", fontWeight: "600" }}>{setting.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: "#FFF0F0", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#FFD5D5", marginTop: 4 }}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF5252" />
          <Text style={{ fontSize: 13, color: "#FF5252", fontWeight: "700" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
