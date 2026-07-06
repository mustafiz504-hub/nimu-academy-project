import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminService, type AdminStats } from "../../../services/admin.service";

const STAT_CARDS = [
  { key: "totalEnrollments", label: "Enrollments", icon: "school", color: "#FF8C00", bg: "#FFF3E0" },
  { key: "totalUsers",       label: "Users",        icon: "people", color: "#3B82F6", bg: "#EFF6FF" },
  { key: "totalOrders",      label: "Orders",       icon: "bag",    color: "#10B981", bg: "#ECFDF5" },
  { key: "totalRevenue",     label: "Revenue (₹)",  icon: "cash",   color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "pendingEnrollments", label: "Pending Enroll", icon: "hourglass", color: "#F59E0B", bg: "#FFFBEB" },
  { key: "pendingOrders",    label: "Pending Orders",   icon: "time",      color: "#EF4444", bg: "#FEF2F2" },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#FF8C00" size="large" /></View>;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#FF8C00"]} tintColor="#FF8C00" />}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Overview</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {STAT_CARDS.map((card) => {
          const value = stats ? stats[card.key] : 0;
          return (
            <View key={card.key} style={{ width: "47%", backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#F0E6D8" }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: card.bg, justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
                <Ionicons name={card.icon as any} size={20} color={card.color} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E1B18" }}>
                {card.key === "totalRevenue" ? `₹${Number(value).toLocaleString()}` : value}
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontWeight: "600" }}>{card.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
