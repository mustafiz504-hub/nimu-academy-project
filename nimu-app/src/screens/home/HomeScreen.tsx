import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";
import { useCourses } from "../../hooks/useCourses";
import CourseCard from "../../components/course/CourseCard";
import StudyReport from "../../components/home/StudyReport";

interface HomeScreenProps {
  onNavigateToTab: (tab: "courses" | "schedule" | "profile") => void;
  onCourseSelect: (courseId: string) => void;
}

export default function HomeScreen({ onNavigateToTab, onCourseSelect }: HomeScreenProps) {
  const { user } = useAuthStore();
  const { courses, loading, fetchAllCourses } = useCourses();

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Header ── */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
        <View>
          <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E1B18" }}>
            {user?.name?.split(" ")[0] || "Chef"}! 👋
          </Text>
        </View>
        <TouchableOpacity style={{ width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <Ionicons name="notifications-outline" size={22} color="#1E1B18" />
          <View style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, backgroundColor: "#FF5252", borderRadius: 4, borderWidth: 1.5, borderColor: "#FFFFFF" }} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* ── Search Bar ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: "#F0E6D8" }}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <Text style={{ flex: 1, marginLeft: 12, fontSize: 14, color: "#94A3B8", fontWeight: "500" }}>
              Search for recipes, techniques...
            </Text>
            <TouchableOpacity style={{ width: 36, height: 36, backgroundColor: "#FFF3E0", borderRadius: 12, justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="options" size={18} color="#FF8C00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Study Report (Placeholder stats) ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <StudyReport />
        </View>

        {/* ── Featured Courses (All courses from API) ── */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18" }}>Featured Courses</Text>
            <TouchableOpacity onPress={() => onNavigateToTab("courses")}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#FF8C00" }}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF8C00" style={{ marginVertical: 40 }} />
          ) : courses.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#94A3B8", marginVertical: 20 }}>No courses available.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
              {courses.map((course, index) => {
                const colors = [
                  { bg: "#FFF3E0", accentBg: "#FFE0B2", accent: "#FF8C00", icon: "restaurant" },
                  { bg: "#F3E8FF", accentBg: "#E9D5FF", accent: "#A855F7", icon: "pizza" },
                  { bg: "#E0F2FE", accentBg: "#BAE6FD", accent: "#0EA5E9", icon: "cafe" },
                  { bg: "#DCFCE7", accentBg: "#BBF7D0", accent: "#22C55E", icon: "nutrition" }
                ];
                const theme = colors[index % colors.length];

                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    backgroundColor={theme.bg}
                    accentBgColor={theme.accentBg}
                    accentColor={theme.accent}
                    iconName={theme.icon}
                    onPress={() => onCourseSelect(course.id)}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── Categories ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18", marginBottom: 16 }}>Top Categories</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {[
              { icon: "🍕", label: "Italian", color: "#FFF3E0", border: "#FFE0B2" },
              { icon: "🥗", label: "Healthy", color: "#ECFCCB", border: "#D9F99D" },
              { icon: "🍰", label: "Baking", color: "#FCE7F3", border: "#FBCFE8" },
              { icon: "🍱", label: "Asian", color: "#E0E7FF", border: "#C7D2FE" }
            ].map((cat, idx) => (
              <TouchableOpacity key={idx} style={{ flexBasis: "48%", backgroundColor: cat.color, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: cat.border }}>
                <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
