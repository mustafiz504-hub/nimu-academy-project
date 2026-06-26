import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
  backgroundColor = "#FFF3E0", 
  iconName = "restaurant", 
  accentColor = "#FF8C00", 
  accentBgColor = "#FFE0B2",
  onPress,
  width = 220
}: CourseCardProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={{ 
        width: width as any, 
        backgroundColor, 
        borderRadius: 24, 
        padding: 20, 
        position: "relative", 
        overflow: "hidden", 
        minHeight: 170, 
        borderWidth: 1, 
        borderColor: "#FFFFFF" 
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }} numberOfLines={1}>
        {course.name}
      </Text>
      <Text style={{ fontSize: 10, color: "#64748B", lineHeight: 15, marginBottom: 16 }} numberOfLines={2}>
        {course.description || "Learn amazing cooking skills."}
      </Text>

      <View style={{ flexDirection: "row", gap: 6, marginTop: "auto", zIndex: 2 }}>
        <View style={{ backgroundColor: "#FFFFFF", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text style={{ fontSize: 9, color: "#64748B", fontWeight: "700" }}>
            {course.duration || "Self Paced"}
          </Text>
        </View>
        <View style={{ backgroundColor: accentBgColor, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text style={{ fontSize: 9, color: accentColor, fontWeight: "700" }}>
            {course.mode || "Online"}
          </Text>
        </View>
      </View>

      {/* Price tag */}
      <View style={{ position: "absolute", top: 16, right: 16, backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
        <Text style={{ fontSize: 10, fontWeight: "800", color: "#1E1B18" }}>
          {course.price > 0 ? `₹${course.price}` : "FREE"}
        </Text>
      </View>

      <View style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.25 }}>
        <Ionicons name={iconName} size={60} color={accentColor} />
      </View>
    </TouchableOpacity>
  );
}
