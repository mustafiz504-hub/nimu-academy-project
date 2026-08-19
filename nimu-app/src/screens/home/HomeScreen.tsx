import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";
import { useCourseStore } from "../../store/course.store";
import CourseCard from "../../components/course/CourseCard";
import StudyReport from "../../components/home/StudyReport";

interface HomeScreenProps {
  onNavigateToTab: (tab: "courses" | "schedule" | "profile") => void;
  onCourseSelect: (courseId: string) => void;
}

export default function HomeScreen({ onNavigateToTab, onCourseSelect }: HomeScreenProps) {
  const { user } = useAuthStore();
  const { courses, loadingCourses: loading, fetchAllCourses, refreshingCourses, refreshAllCourses } = useCourseStore();

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const handleRefresh = useCallback(async () => {
    await refreshAllCourses();
  }, [refreshAllCourses]);

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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingCourses}
            onRefresh={handleRefresh}
            colors={["#FF8C00"]}
            tintColor="#FF8C00"
            title="Refreshing..."
            titleColor="#94A3B8"
          />
        }
      >

        {/* ── Study Report (Placeholder stats) ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 22 }}>
          <StudyReport />
        </View>

        {/* ── Featured Courses (All courses from API) ── */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 }}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14, gap: 16 }}>
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

      </ScrollView>
    </View>
  );
}
