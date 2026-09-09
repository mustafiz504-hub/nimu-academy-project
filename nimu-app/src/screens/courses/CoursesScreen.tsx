import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCourseStore } from "../../store/course.store";

interface CoursesScreenProps {
  onCourseSelect: (courseId: string) => void;
}

export default function CoursesScreen({ onCourseSelect }: CoursesScreenProps) {
  const {
    courses,
    myEnrollments,
    loadingCourses,
    loadingEnrollments,
    refreshingCourses,
    refreshingEnrollments,
    fetchAllCourses,
    fetchMyEnrollments,
    refreshAllCourses,
    refreshMyEnrollments,
  } = useCourseStore();

  useEffect(() => {
    fetchAllCourses();
    fetchMyEnrollments();
  }, [fetchAllCourses, fetchMyEnrollments]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshAllCourses(), refreshMyEnrollments()]);
  }, [refreshAllCourses, refreshMyEnrollments]);

  const isRefreshing = refreshingCourses || refreshingEnrollments;

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#1E1B18" }}>My Learning</Text>
        <Text style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Explore & pick up where you left off</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#FF8C00"]}
            tintColor="#FF8C00"
            title="Refreshing..."
            titleColor="#94A3B8"
          />
        }
      >
        {/* ── Categories Tabs ── */}
        <View style={{ flexDirection: "row", marginBottom: 24 }}>
          <View style={{ backgroundColor: "#1E1B18", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 12 }}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>All Courses</Text>
          </View>
          <View style={{ backgroundColor: "#FFFFFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#F0E6D8" }}>
            <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Certificates</Text>
          </View>
        </View>

        {(loadingCourses || loadingEnrollments) ? (
          <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="book-outline" size={80} color="#CBD5E1" />
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E1B18", marginTop: 16 }}>No Courses Found</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {courses.map((course) => {
              const isFree = Number(course.price) === 0;
              const enrollment = myEnrollments.find(
                (e) =>
                  String(e.course_id) === String(course.id) &&
                  (e.status === "confirmed" || e.status === "completed")
              );
              const isEnrolled = !!enrollment;
              const isUnlocked = isFree || isEnrolled;

              return (
                <TouchableOpacity
                  key={course.id}
                  onPress={() => onCourseSelect(course.id)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 24,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isUnlocked ? "#F0E6D8" : "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isUnlocked ? 0.05 : 0.02,
                    shadowRadius: 12,
                    elevation: isUnlocked ? 4 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {/* Thumbnail */}
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      backgroundColor: "#FFF3E0",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <Ionicons name="fast-food-outline" size={32} color="#FF8C00" />

                    {/* Lock Overlay */}
                    {!isUnlocked && (
                      <View
                        style={{
                          position: "absolute",
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: "rgba(0,0,0,0.4)",
                          borderRadius: 16,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text
                      style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }}
                      numberOfLines={1}
                    >
                      {course.name}
                    </Text>

                    {isFree ? (
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#ECFCCB",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: "#65A30D", fontWeight: "800" }}>FREE COURSE</Text>
                      </View>
                    ) : isEnrolled ? (
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#ECFCCB",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: "#65A30D", fontWeight: "800" }}>✓ ENROLLED</Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 15, color: "#FF8C00", fontWeight: "800", marginBottom: 8 }}>
                        ₹{Number(course.price).toLocaleString("en-IN")}
                      </Text>
                    )}

                    {/* Progress Bar (Only if unlocked) */}
                    {isUnlocked && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ flex: 1, height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                          <View style={{ width: "40%", height: "100%", backgroundColor: "#FF8C00", borderRadius: 3 }} />
                        </View>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#1E1B18" }}>40%</Text>
                      </View>
                    )}

                    {/* Tap hint for locked courses */}
                    {!isUnlocked && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="arrow-forward-circle-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "500" }}>Tap to view & enroll</Text>
                      </View>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
