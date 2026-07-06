import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { adminService, type AdminUser } from "../../../services/admin.service";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/auth.store";

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isSuperAdmin = currentUser?.role === "superadmin";

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setUsers(await adminService.getUsers());
    } catch { } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRole = (user: AdminUser) => {
    if (!isSuperAdmin) return Alert.alert("Access Denied", "Only superadmin can change roles.");
    const isAdmin = user.role === "admin";
    Alert.alert(
      isAdmin ? "Remove Admin" : "Make Admin",
      `${isAdmin ? "Demote" : "Promote"} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm", onPress: async () => {
            try {
              isAdmin ? await adminService.removeAdmin(user.id) : await adminService.makeAdmin(user.id);
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: isAdmin ? "user" : "admin" } : u));
            } catch (e: any) { Alert.alert("Error", e?.response?.data?.message || "Failed."); }
          }
        }
      ]
    );
  };

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#FF8C00" size="large" /></View>;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 10 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#FF8C00"]} tintColor="#FF8C00" />}
    >
      <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        {users.length} Users
      </Text>
      {users.map((u) => (
        <View key={u.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: u.role === "admin" ? "#FFF3E0" : "#F1F5F9", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
            <Ionicons name={u.role === "admin" ? "shield" : "person"} size={20} color={u.role === "admin" ? "#FF8C00" : "#94A3B8"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{u.name}</Text>
            <Text style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>{u.email}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleRole(u)}
            style={{
              backgroundColor: u.role === "admin" ? "#FEE2E2" : "#DCFCE7",
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "800", color: u.role === "admin" ? "#B91C1C" : "#166534", textTransform: "uppercase" }}>
              {u.role === "admin" ? "Admin ✕" : "→ Admin"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
