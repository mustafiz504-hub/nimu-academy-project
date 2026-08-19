import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";

import AdminDashboard  from "./sections/AdminDashboard";
import AdminEnrollments from "./sections/AdminEnrollments";
import AdminCourses    from "./sections/AdminCourses";
import AdminUsers      from "./sections/AdminUsers";
import AdminStudents   from "./sections/AdminStudents";
import AdminCourseManager from "./sections/AdminCourseManager";

type Section = "dashboard" | "enrollments" | "courseManager" | "courses" | "users" | "students";

const SECTIONS: { key: Section; label: string; icon: any; color: string; bg: string }[] = [
  { key: "dashboard",   label: "Dashboard",   icon: "stats-chart",   color: "#FF8C00", bg: "#FFF3E0" },
  { key: "enrollments", label: "Enrollments", icon: "school",        color: "#3B82F6", bg: "#EFF6FF" },
  { key: "courseManager", label: "Course Manager", icon: "wallet",    color: "#EAB308", bg: "#FEF9C3" },
  { key: "courses",     label: "Courses",     icon: "videocam",      color: "#10B981", bg: "#ECFDF5" },
  { key: "users",       label: "Users",       icon: "people",        color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "students",    label: "Students",    icon: "ribbon",        color: "#F59E0B", bg: "#FFFBEB" },
];

export default function AdminScreen() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const current = SECTIONS.find(s => s.key === activeSection)!;

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":   return <AdminDashboard />;
      case "enrollments": return <AdminEnrollments />;
      case "courseManager": return <AdminCourseManager />;
      case "courses":     return <AdminCourses />;
      case "users":       return <AdminUsers />;
      case "students":    return <AdminStudents />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Top Header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#1E1B18" }}>Admin Panel</Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              {user?.name} ·{" "}
              <Text style={{ color: "#FF8C00", fontWeight: "700", textTransform: "capitalize" }}>{user?.role}</Text>
            </Text>
          </View>
          <View style={{ backgroundColor: "#FFF3E0", borderRadius: 12, width: 42, height: 42, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#FFE0B2" }}>
            <Ionicons name="shield" size={20} color="#FF8C00" />
          </View>
        </View>

        {/* ── Section pills (horizontal scroll) ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {SECTIONS.map((s) => {
            const isActive = activeSection === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setActiveSection(s.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: isActive ? s.color : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isActive ? s.color : "#F0E6D8",
                }}
              >
                <Ionicons name={s.icon} size={14} color={isActive ? "#FFFFFF" : s.color} />
                <Text style={{ fontSize: 12, fontWeight: "700", color: isActive ? "#FFFFFF" : "#64748B" }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Active section title bar ── */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: current.bg, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name={current.icon} size={15} color={current.color} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18" }}>{current.label}</Text>
      </View>

      {/* ── Section content ── */}
      <View style={{ flex: 1 }}>
        {renderSection()}
      </View>
    </View>
  );
}
