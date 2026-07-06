import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LessonCardProps {
  title: string;
  chapterText: string;
  category: string;
  backgroundColor: string;
  iconName: any;
  progress: number;
}

export default function LessonCard({
  title,
  chapterText,
  category,
  backgroundColor,
  iconName,
  progress
}: LessonCardProps) {
  return (
    <View 
      className="w-[230px] rounded-3xl p-5 relative overflow-hidden min-h-[170px]"
      style={{ 
        width: 230, 
        backgroundColor: backgroundColor, 
        borderRadius: 24, 
        padding: 20, 
        position: "relative", 
        overflow: "hidden", 
        minHeight: 170, 
        marginRight: 16 
      }}
    >
      <Text className="text-xl font-extrabold text-white mb-1" style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>
        {title}
      </Text>
      <Text className="text-[10px] text-white/80 mb-4" style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.8)", marginBottom: 16 }}>
        {chapterText}
      </Text>
      
      <View className="flex-row gap-1.5 mb-5" style={{ flexDirection: "row", gap: 6, marginBottom: 20 }}>
        <View className="bg-white/20 px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text className="text-[9px] text-white font-bold" style={{ fontSize: 9, color: "#FFFFFF", fontWeight: "700" }}>Child</Text>
        </View>
        <View className="bg-white/20 px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text className="text-[9px] text-white font-bold" style={{ fontSize: 9, color: "#FFFFFF", fontWeight: "700" }}>5-8</Text>
        </View>
        <View className="bg-white/20 px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
          <Text className="text-[9px] text-white font-bold" style={{ fontSize: 9, color: "#FFFFFF", fontWeight: "700" }}>{category}</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-auto gap-3.5" style={{ flexDirection: "row", alignItems: "center", marginTop: "auto", gap: 14 }}>
        <View className="flex-1 h-1.5 bg-white/30 rounded-full" style={{ flex: 1, height: 6, backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: 3 }}>
          <View className="h-full bg-white rounded-full" style={{ height: "100%", backgroundColor: "#FFFFFF", borderRadius: 3, width: `${progress}%` }} />
        </View>
        <Text className="text-[10px] font-bold text-white" style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>{progress}%</Text>
      </View>

      <View className="absolute top-5 right-5" style={{ position: "absolute", top: 20, right: 20 }}>
        <Ionicons name={iconName} size={48} color="#FFFFFF" style={{ opacity: 0.8 }} />
      </View>
    </View>
  );
}
