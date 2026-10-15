import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";
import { useAppAlert } from "../../components/common/AppAlert";
import { AVATAR_LIST, DEFAULT_AVATAR } from "../../constants/avatars";

export default function ProfileScreen() {
  const { user, logout, updateProfile, refreshProfile, deleteAccount } = useAuthStore();
  const appAlert = useAppAlert();

  const [refreshing, setRefreshing] = useState(false);

  // Sync latest profile from database whenever screen is opened
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  // Edit Profile Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || DEFAULT_AVATAR);
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

  const handleDeleteAccount = () => {
    appAlert.show({
      title: "Delete Account?",
      message: "Are you sure you want to delete your account? All your personal profile data, enrolled course progress, and certificates will be permanently deleted. This action cannot be undone.",
      type: "danger",
      icon: "trash-outline",
      buttons: [
        { text: "Cancel", style: "secondary" },
        {
          text: "Delete My Account",
          style: "danger",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err: any) {
              appAlert.show({
                title: "Error",
                message: err?.response?.data?.message || "Could not delete account. Please try again or contact support.",
                type: "danger",
              });
            }
          },
        },
      ],
    });
  };

  const openEditModal = () => {
    setNameInput(user?.name ?? "");
    setSelectedAvatar(user?.avatar || DEFAULT_AVATAR);
    setNameError("");
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
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
      await updateProfile({
        name: trimmed,
        avatar: selectedAvatar,
      });
      setEditModalVisible(false);
      appAlert.show({
        title: "Profile Updated!",
        message: "Your name and avatar have been updated successfully.",
        type: "success",
        icon: "checkmark-circle-outline",
        buttons: [{ text: "OK", style: "primary" }],
      });
    } catch (err: any) {
      setNameError(err?.response?.data?.message || "Failed to update profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingPress = (text: string) => {
    if (text === "Edit Profile Information") {
      openEditModal();
    } else if (text === "Security & Privacy") {
      appAlert.show({
        title: "Security & Privacy",
        message: "Your data is encrypted in transit and securely stored. You can request permanent deletion of your account and personal data at any time.",
        type: "info",
        icon: "shield-checkmark-outline",
        buttons: [
          { text: "Close", style: "secondary" },
          { text: "Delete Account", style: "danger", onPress: handleDeleteAccount },
        ],
      });
    } else if (text === "Notification Preferences") {
      appAlert.show({
        title: "Notifications",
        message: "Course updates and class alerts are currently active.",
        type: "info",
        icon: "notifications-outline",
        buttons: [{ text: "OK", style: "primary" }],
      });
    }
  };

  const currentAvatarUri = user?.avatar || DEFAULT_AVATAR;

  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFA726"]} tintColor="#FFA726" />
        }
      >
        {/* Profile Card */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 24 }}>
          <TouchableOpacity onPress={openEditModal} activeOpacity={0.8} style={{ position: "relative" }}>
            <ExpoImage
              source={{ uri: currentAvatarUri }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 3,
                borderColor: "#FFA726",
                backgroundColor: "#FFF8F0",
                marginBottom: 12,
              }}
              contentFit="cover"
              transition={300}
            />
            <View
              style={{
                position: "absolute",
                bottom: 12,
                right: 0,
                backgroundColor: "#FF8C00",
                width: 28,
                height: 28,
                borderRadius: 14,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18" }}>
            {user?.name ?? "Student"}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2, marginBottom: 4 }}>
            {user?.email ?? ""}
          </Text>
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
            style={{ backgroundColor: "#FFF5F5", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#FED7D7", marginTop: 4 }}
          >
            <Ionicons name="log-out-outline" size={22} color="#E53E3E" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 13, color: "#E53E3E", fontWeight: "700" }}>Sign Out</Text>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ backgroundColor: "#F8FAFC", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", marginTop: 2 }}
          >
            <Ionicons name="trash-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}>Delete Account & Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile & Avatar Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "85%" }}>
            {/* Modal Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>Edit Profile</Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Choose an avatar and update your details</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Avatar Selector Section */}
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 10, letterSpacing: 0.5 }}>
                CHOOSE AVATAR (20 EXCLUSIVE STYLES)
              </Text>
              
              <View style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "space-between",
                padding: 12,
                backgroundColor: "#FFFBF5",
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#F0E6D8",
                marginBottom: 20,
              }}>
                {AVATAR_LIST.map((av) => {
                  const isSelected = selectedAvatar === av.url;
                  return (
                    <TouchableOpacity
                      key={av.id}
                      onPress={() => setSelectedAvatar(av.url)}
                      activeOpacity={0.7}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#FFFFFF",
                        borderWidth: isSelected ? 2.5 : 1,
                        borderColor: isSelected ? "#FF8C00" : "#E2E8F0",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        shadowColor: isSelected ? "#FF8C00" : "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isSelected ? 0.3 : 0.05,
                        shadowRadius: 2,
                        elevation: isSelected ? 3 : 1,
                      }}
                    >
                      <ExpoImage
                        source={{ uri: av.url }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        contentFit="cover"
                        transition={200}
                      />
                      {isSelected && (
                        <View style={{
                          position: "absolute",
                          top: -3,
                          right: -3,
                          backgroundColor: "#FF8C00",
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 1.5,
                          borderColor: "#FFFFFF",
                        }}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
                  onSubmitEditing={handleSaveProfile}
                />
              </View>
              {nameError ? (
                <Text style={{ fontSize: 12, color: "#FF5252", marginBottom: 8 }}>{nameError}</Text>
              ) : null}

              {/* Email (read-only) */}
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8, marginTop: 12, letterSpacing: 0.5 }}>
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
                marginBottom: 24,
              }}>
                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, fontSize: 15, color: "#94A3B8", paddingVertical: 14 }}>
                  {user?.email ?? ""}
                </Text>
                <Ionicons name="lock-closed-outline" size={14} color="#CBD5E1" />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                style={{
                  backgroundColor: saving ? "#FFD599" : "#FFA726",
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                )}
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
