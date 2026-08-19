import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Course } from "../../types/course.types";

interface CourseCardProps {
  course: Course;
  backgroundColor?: string;
  iconName?: any;
  accentColor?: string;
  accentBgColor?: string;
  onPress?: () => void;
  width?: number | string;
}

export default function CourseCard({ 
  course, 
  backgroundColor = "#FFFFFF", 
  iconName = "restaurant", 
  accentColor = "#FF8C00", 
  accentBgColor = "#FFE0B2",
  onPress,
  width = 260
}: CourseCardProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      style={{ 
        width: width as any, 
        backgroundColor, 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: "rgba(255, 255, 255, 0.8)",
        shadowColor: "#1E1B18",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <View style={{ borderRadius: 23, overflow: "hidden" }}>
        {/* ── Image Section ── */}
        <View style={{ height: 140, backgroundColor: "#E2E8F0", position: "relative" }}>
          {course.thumbnail_url ? (
            <Image 
              source={{ uri: course.thumbnail_url }} 
              style={{ width: "100%", height: "100%" }} 
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Ionicons name={iconName} size={42} color={accentColor} />
            </View>
          )}
          
          {/* Price Tag Overlay */}
          <View style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(255, 255, 255, 0.95)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#1E1B18" }}>
              {course.price > 0 ? `₹${course.price}` : "FREE"}
            </Text>
          </View>
        </View>

        {/* ── Details Section ── */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }} numberOfLines={1}>
            {course.name}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748B", lineHeight: 16, marginBottom: 12 }} numberOfLines={2}>
            {course.description || "Learn amazing skills."}
          </Text>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, gap: 4 }}>
              <Ionicons name="time-outline" size={12} color="#475569" />
              <Text style={{ fontSize: 10, color: "#475569", fontWeight: "700" }}>
                {course.duration || "Self Paced"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: accentBgColor, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, gap: 4 }}>
              <Ionicons name="videocam-outline" size={12} color={accentColor} />
              <Text style={{ fontSize: 10, color: accentColor, fontWeight: "700" }}>
                {course.mode || "Online"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
