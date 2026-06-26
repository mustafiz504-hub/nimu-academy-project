import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CourseCardProps {
  title: string;
  subtitle: string;
  category: string;
  backgroundColor: string;
  iconName: any;
  accentColor: string;
  accentBgColor: string;
}

export default function CourseCard({
  title,
  subtitle,
  category,
  backgroundColor,
  iconName,
  accentColor,
  accentBgColor
}: CourseCardProps) {
  return (
    <View 
      className="w-[220px] rounded-3xl p-5 relative overflow-hidden min-h-[170px] border border-white"
      style={{ 
        width: 220, 
        backgroundColor: backgroundColor, 
        borderRadius: 24, 
        padding: 20, 
        position: "relative", 
        overflow: "hidden", 
        minHeight: 170, 
        borderWidth: 1, 
        borderColor: "#FFFFFF" 
      }}
    >
      <Text className="text-lg font-extrabold text-[#1E1B18] mb-1" style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }}>
        {title}
      </Text>
      <Text className="text-[10px] text-slate-500 leading-4 mb-4" style={{ fontSize: 10, color: "#64748B", lineHeight: 15, marginBottom: 16 }}>
        {subtitle}
      </Text>
      
      <View className="flex-row gap-1.5 mt-auto z-10" style={{ flexDirection: "row", gap: 6, marginTop: "auto", zIndex: 2 }}>
        <View className="bg-white px-2 py-1 rounded-full" style={{ backgroundColor: "#FFFFFF", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text className="text-[9px] text-slate-500 font-bold" style={{ fontSize: 9, color: "#64748B", fontWeight: "700" }}>Child</Text>
        </View>
        <View className="bg-white px-2 py-1 rounded-full" style={{ backgroundColor: "#FFFFFF", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text className="text-[9px] text-slate-500 font-bold" style={{ fontSize: 9, color: "#64748B", fontWeight: "700" }}>5-8</Text>
        </View>
        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: accentBgColor, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text className="text-[9px] font-bold" style={{ fontSize: 9, color: accentColor, fontWeight: "700" }}>{category}</Text>
        </View>
      </View>

      <View className="absolute -bottom-2 -right-2 opacity-25" style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.25 }}>
        <Ionicons name={iconName} size={60} color={accentColor} />
      </View>
    </View>
  );
}
