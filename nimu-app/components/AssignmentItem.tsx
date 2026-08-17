import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AssignmentItemProps {
  id: number;
  title: string;
  category: string;
  completed: boolean;
  count: string;
  onToggle: () => void;
}

export default function AssignmentItem({
  title,
  category,
  completed,
  count,
  onToggle
}: AssignmentItemProps) {
  return (
    <View 
      className="bg-white rounded-2xl p-4 flex-row justify-between items-center border border-[#F0E6D8]"
      style={{ 
        backgroundColor: "#FFFFFF", 
        borderRadius: 20, 
        padding: 16, 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        borderWidth: 1, 
        borderColor: "#F0E6D8" 
      }}
    >
      <View className="flex-row items-center gap-3" style={{ flexDirection: "row", alignItems: "center" }}>
        <View 
          className="w-11 h-11 rounded-xl bg-[#FFF3E0] justify-center items-center"
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 12, 
            backgroundColor: "#FFF3E0", 
            justifyContent: "center", 
            alignItems: "center", 
            marginRight: 12 
          }}
        >
          <Ionicons name={category === "Arts" ? "brush" : "book-outline"} size={20} color="#FFA726" />
        </View>
        <View>
          <Text className="text-sm font-bold text-[#1E1B18]" style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>
            {title}
          </Text>
          <View className="flex-row gap-1 mt-1" style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
            <Text className="text-[8px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-bold" style={{ fontSize: 8, color: "#64748B", backgroundColor: "#F1F5F9", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, fontWeight: "700" }}>Child</Text>
            <Text className="text-[8px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-bold" style={{ fontSize: 8, color: "#64748B", backgroundColor: "#F1F5F9", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, fontWeight: "700" }}>5-8</Text>
            <Text className="text-[8px] text-[#FFA726] bg-[#FFE0B2] px-1.5 py-0.5 rounded-md font-bold" style={{ fontSize: 8, color: "#FFA726", backgroundColor: "#FFE0B2", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, fontWeight: "700" }}>{category}</Text>
          </View>
          <Text className="text-[10px] text-slate-400 mt-1.5" style={{ fontSize: 10, color: "#94A3B8", marginTop: 6 }}>
            <Ionicons name="people" size={11} color="#94A3B8" /> {count}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        className={`px-4 py-2 rounded-full ${completed ? "bg-slate-100" : "bg-[#FF5722]"}`}
        style={{ backgroundColor: completed ? "#E2E8F0" : "#FF5722", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 }}
        onPress={onToggle}
      >
        <Text 
          className={`text-[11px] font-bold ${completed ? "text-slate-400" : "text-white"}`}
          style={{ fontSize: 11, fontWeight: "700", color: completed ? "#64748B" : "#FFFFFF" }}
        >
          {completed ? "Completed" : "Complete"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
