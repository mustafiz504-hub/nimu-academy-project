import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCourses } from "../../hooks/useCourses";

interface CoursesScreenProps {
  onCourseSelect: (courseId: string) => void;
}

export default function CoursesScreen({ onCourseSelect }: CoursesScreenProps) {
  const { myEnrollments, loading, fetchMyEnrollments } = useCourses();

  useEffect(() => {
    fetchMyEnrollments();
  }, [fetchMyEnrollments]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#1E1B18" }}>My Learning</Text>
        <Text style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Pick up where you left off</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* ── Categories Tabs ── */}
        <View style={{ flexDirection: "row", marginBottom: 24 }}>
          <View style={{ backgroundColor: "#1E1B18", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 12 }}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>All Courses</Text>
          </View>
          <View style={{ backgroundColor: "#FFFFFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#F0E6D8" }}>
            <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Certificates</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 40 }} />
        ) : myEnrollments.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="book-outline" size={80} color="#CBD5E1" />
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E1B18", marginTop: 16 }}>No Enrollments Yet</Text>
            <Text style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", marginTop: 8 }}>
              You haven't bought any courses. Browse the home screen to find your next recipe!
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {myEnrollments.map((enrollment) => (
              <TouchableOpacity
                key={enrollment.id}
                onPress={() => onCourseSelect(enrollment.course_id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#F0E6D8",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                  elevation: 4,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                {/* Thumbnail */}
                <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center" }}>
                  {enrollment.thumbnail_url ? (
                    <Image source={{ uri: enrollment.thumbnail_url }} style={{ width: "100%", height: "100%", borderRadius: 16 }} />
                  ) : (
                    <Ionicons name="fast-food-outline" size={32} color="#FF8C00" />
                  )}
                </View>

                {/* Details */}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }} numberOfLines={1}>
                    {enrollment.course_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                    Status: <Text style={{ color: enrollment.status === "confirmed" ? "#4CAF50" : "#FFA726", fontWeight: "700", textTransform: "capitalize" }}>{enrollment.status}</Text>
                  </Text>
                  
                  {/* Progress Bar Mock */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ flex: 1, height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ width: "40%", height: "100%", backgroundColor: "#FF8C00", borderRadius: 3 }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#1E1B18" }}>40%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
