import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminService, type AdminEnrollment } from "../../../services/admin.service";
import { useAppAlert } from "../../../components/common/AppAlert";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#FEF9C3", text: "#A16207" },
  confirmed: { bg: "#DCFCE7", text: "#166534" },
  completed: { bg: "#DBEAFE", text: "#1D4ED8" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C" },
};

const NEXT_STATUSES: Record<string, string[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const appAlert = useAppAlert();

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await adminService.getEnrollments();
      setEnrollments(data);
    } catch { } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateEnrollmentStatus(id, status);
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: status as any } : e));
    } catch (e: any) {
      appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed to update enrollment.", type: "danger" });
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#FF8C00" size="large" /></View>;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 10 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#FF8C00"]} tintColor="#FF8C00" />}
    >
      <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        {enrollments.length} Enrollments
      </Text>
      {enrollments.map((e) => {
        const isExpanded = expandedId === e.id;
        const color = STATUS_COLORS[e.status] ?? STATUS_COLORS.pending;
        return (
          <TouchableOpacity
            key={e.id}
            onPress={() => setExpandedId(isExpanded ? null : e.id)}
            activeOpacity={0.85}
            style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#F0E6D8" }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{e.student_name || "Unknown"}</Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }} numberOfLines={1}>{e.course_name}</Text>
                <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{e.phone} {e.email ? `· ${e.email}` : ""}</Text>
              </View>
              <View style={{ backgroundColor: color.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginLeft: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: "800", color: color.text, textTransform: "uppercase" }}>{e.status}</Text>
              </View>
            </View>

            {isExpanded && (
              <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 }}>
                <Text style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>
                  Enrolled: {new Date(e.created_at).toLocaleDateString()}  {e.city ? `· ${e.city}` : ""}
                </Text>
                {NEXT_STATUSES[e.status]?.length > 0 && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {NEXT_STATUSES[e.status].map((nextStatus) => (
                      <TouchableOpacity
                        key={nextStatus}
                        onPress={() => {
                          appAlert.show({
                            title: "Update Status",
                            message: `Change enrollment status to "${nextStatus}"?`,
                            type: nextStatus === "cancelled" ? "danger" : "info",
                            buttons: [
                              { text: "Cancel", style: "secondary" },
                              { text: "Confirm", style: nextStatus === "cancelled" ? "danger" : "primary", onPress: () => updateStatus(e.id, nextStatus) },
                            ]
                          });
                        }}
                        style={{
                          backgroundColor: nextStatus === "cancelled" ? "#FEE2E2" : "#DCFCE7",
                          paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "700", color: nextStatus === "cancelled" ? "#B91C1C" : "#166534", textTransform: "capitalize" }}>
                          → {nextStatus}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
