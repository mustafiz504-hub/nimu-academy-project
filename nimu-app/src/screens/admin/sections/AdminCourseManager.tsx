import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, 
  RefreshControl, TextInput, Modal, KeyboardAvoidingView, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminService, type CoursePurchase, type AdminUser } from "../../../services/admin.service";
import { useCourseStore } from "../../../store/course.store";
import { useAppAlert } from "../../../components/common/AppAlert";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  completed: { bg: "#DCFCE7", text: "#166534" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C" },
  pending:   { bg: "#FEF9C3", text: "#A16207" },
  confirmed: { bg: "#DBEAFE", text: "#1D4ED8" },
};

export default function AdminCourseManager() {
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const appAlert = useAppAlert();

  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const { courses, fetchAllCourses } = useCourseStore();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [granting, setGranting] = useState(false);
  
  // Modals Search
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase();
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, userSearchQuery]);

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await adminService.getCoursePurchases();
      setPurchases(data);
    } catch (e: any) {
      appAlert.show({ title: "Error", message: "Failed to load purchases", type: "danger" });
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [appAlert]);

  useEffect(() => {
    load();
    fetchAllCourses();
    adminService.getUsers().then(setUsers).catch(() => {});
  }, [load, fetchAllCourses]);

  const handleRevoke = (id: string, userName: string, courseName: string) => {
    appAlert.show({
      title: "Revoke Access",
      message: `Are you sure you want to revoke access to "${courseName}" for ${userName}?`,
      type: "danger",
      buttons: [
        { text: "Cancel", style: "secondary" },
        { 
          text: "Revoke", style: "danger", 
          onPress: async () => {
            try {
              await adminService.revokeCourseAccess(id);
              load(true);
              appAlert.show({ title: "Success", message: "Access revoked.", type: "success" });
            } catch (e: any) {
              appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed", type: "danger" });
            }
          }
        }
      ]
    });
  };

  const handleGrant = async () => {
    if (!selectedUserId || !selectedCourseId) {
      appAlert.show({ title: "Validation", message: "Please select both user and course.", type: "warning" });
      return;
    }
    setGranting(true);
    try {
      await adminService.grantCourseAccess(selectedUserId, selectedCourseId);
      setGrantModalVisible(false);
      setSelectedUserId("");
      setSelectedCourseId("");
      load(true);
      appAlert.show({ title: "Success", message: "Course access granted successfully.", type: "success" });
    } catch (e: any) {
      appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed to grant access.", type: "danger" });
    } finally {
      setGranting(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    if (!searchQuery.trim()) return purchases;
    const q = searchQuery.toLowerCase();
    return purchases.filter(p => 
      p.user_name?.toLowerCase().includes(q) || 
      p.user_email?.toLowerCase().includes(q) || 
      p.course_name?.toLowerCase().includes(q)
    );
  }, [purchases, searchQuery]);

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#FF8C00" size="large" /></View>;

  return (
    <View style={{ flex: 1 }}>
      {/* ── Toolbar ── */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search user or course..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: "#1E1B18" }}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          onPress={() => setGrantModalVisible(true)}
          style={{ backgroundColor: "#FF8C00", paddingHorizontal: 16, borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 6 }}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Grant Access</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#FF8C00"]} tintColor="#FF8C00" />}
      >
        <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
          {filteredPurchases.length} Course Purchases
        </Text>
        
        {filteredPurchases.map((p) => {
          const color = STATUS_COLORS[p.status?.toLowerCase()] ?? STATUS_COLORS.pending;
          const isGranted = p.amount == 0;
          
          return (
            <View key={p.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#F0E6D8" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E1B18" }}>{p.user_name || "Unknown User"}</Text>
                  <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{p.user_email}</Text>
                  <Text style={{ fontSize: 14, color: "#0F172A", marginTop: 8, fontWeight: "600" }}>{p.course_name}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <View style={{ backgroundColor: color.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: color.text, textTransform: "uppercase" }}>
                      {p.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: isGranted ? "#10B981" : "#1E1B18" }}>
                    {isGranted ? "FREE (Granted)" : `₹${p.amount}`}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontSize: 11, color: "#94A3B8" }}>Purchased: {new Date(p.created_at).toLocaleDateString()}</Text>
                  {p.message && p.message !== "null" && (
                    <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2, fontStyle: "italic" }}>Note: {p.message}</Text>
                  )}
                </View>
                
                {p.status?.toLowerCase() !== 'cancelled' && (
                  <TouchableOpacity
                    onPress={() => handleRevoke(p.id, p.user_name, p.course_name)}
                    style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    <Ionicons name="ban" size={14} color="#B91C1C" />
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#B91C1C" }}>Revoke</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Grant Access Modal ── */}
      <Modal visible={grantModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18" }}>Grant Course Access</Text>
                <TouchableOpacity onPress={() => setGrantModalVisible(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 }}>1. Select User</Text>
                
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12 }}>
                  <Ionicons name="search" size={16} color="#94A3B8" />
                  <TextInput
                    placeholder="Search name or email..."
                    value={userSearchQuery}
                    onChangeText={setUserSearchQuery}
                    style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8, fontSize: 13, color: "#1E1B18" }}
                    placeholderTextColor="#94A3B8"
                  />
                  {userSearchQuery ? (
                    <TouchableOpacity onPress={() => setUserSearchQuery("")}>
                      <Ionicons name="close-circle" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={{ maxHeight: 200, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                  <ScrollView nestedScrollEnabled style={{ backgroundColor: "#F8FAFC" }}>
                    <View style={{ gap: 2, padding: 4 }}>
                      {filteredUsers.map(u => (
                        <TouchableOpacity
                          key={u.id}
                          onPress={() => setSelectedUserId(u.id)}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8,
                            backgroundColor: selectedUserId === u.id ? "#FF8C00" : "transparent",
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: "700", color: selectedUserId === u.id ? "#FFFFFF" : "#1E1B18" }}>
                            {u.name} {u.role === 'superadmin' ? '(Superadmin)' : ''}
                          </Text>
                          <Text style={{ fontSize: 11, color: selectedUserId === u.id ? "#FFEDD5" : "#64748B" }}>
                            {u.email}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {filteredUsers.length === 0 && (
                        <Text style={{ padding: 12, textAlign: "center", color: "#94A3B8", fontSize: 12 }}>No users found.</Text>
                      )}
                    </View>
                  </ScrollView>
                </View>

                <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 }}>2. Select Course</Text>
                <View style={{ gap: 10 }}>
                  {courses.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setSelectedCourseId(c.id)}
                      style={{
                        padding: 14, borderRadius: 12, borderWidth: 1,
                        borderColor: selectedCourseId === c.id ? "#FF8C00" : "#E2E8F0",
                        backgroundColor: selectedCourseId === c.id ? "#FFF7ED" : "#FFFFFF",
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Price: ₹{c.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleGrant}
                disabled={granting || !selectedUserId || !selectedCourseId}
                style={{
                  backgroundColor: granting || !selectedUserId || !selectedCourseId ? "#CBD5E1" : "#FF8C00",
                  paddingVertical: 16, borderRadius: 16, alignItems: "center",
                }}
              >
                {granting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>Grant Access</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
