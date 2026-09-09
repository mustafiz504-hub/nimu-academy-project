import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";
import { useAppAlert } from "../../components/common/AppAlert";

export default function ProfileScreen() {
  const { user, logout, updateName } = useAuthStore();
  const appAlert = useAppAlert();

  // Edit Profile Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleLogout = () => {
    appAlert.show({
      title: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      type: "warning",
      icon: "log-out-outline",
      buttons: [
        { text: "Cancel", style: "secondary" },
        { text: "Sign Out", style: "danger", onPress: () => logout() },
      ],
    });
  };

  const openEditModal = () => {
    setNameInput(user?.name ?? "");
    setNameError("");
    setEditModalVisible(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError("Name cannot be empty.");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      await updateName(trimmed);
      setEditModalVisible(false);
      appAlert.show({
        title: "Updated!",
        message: "Your name has been updated successfully.",
        type: "success",
        icon: "checkmark-circle-outline",
        buttons: [{ text: "OK", style: "primary" }],
      });
    } catch (err: any) {
      setNameError(err?.response?.data?.message || "Failed to update name. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingPress = (text: string) => {
    if (text === "Edit Profile Information") {
      openEditModal();
    }
  };

  return (
    <>
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
              onPress={() => handleSettingPress(setting.text)}
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

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8, letterSpacing: 0.5 }}>
              FULL NAME
            </Text>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: nameError ? "#FF5252" : "#E2E8F0",
              borderRadius: 14,
              paddingHorizontal: 14,
              backgroundColor: "#F8FAFC",
              marginBottom: 6,
            }}>
              <Ionicons name="person-outline" size={18} color="#FFA726" style={{ marginRight: 10 }} />
              <TextInput
                value={nameInput}
                onChangeText={(t) => { setNameInput(t); setNameError(""); }}
                placeholder="Enter your full name"
                placeholderTextColor="#CBD5E1"
                style={{ flex: 1, fontSize: 15, color: "#1E1B18", paddingVertical: 14 }}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
            </View>
            {nameError ? (
              <Text style={{ fontSize: 12, color: "#FF5252", marginBottom: 8 }}>{nameError}</Text>
            ) : null}

            {/* Email (read-only) */}
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8, marginTop: 16, letterSpacing: 0.5 }}>
              EMAIL (cannot be changed)
            </Text>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#E2E8F0",
              borderRadius: 14,
              paddingHorizontal: 14,
              backgroundColor: "#F1F5F9",
              marginBottom: 28,
            }}>
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, fontSize: 15, color: "#94A3B8", paddingVertical: 14 }}>
                {user?.email ?? ""}
              </Text>
              <Ionicons name="lock-closed-outline" size={14} color="#CBD5E1" />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveName}
              disabled={saving}
              style={{
                backgroundColor: saving ? "#FFD599" : "#FFA726",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              )}
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
