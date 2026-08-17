import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
      <View 
        className="bg-white rounded-3xl p-6 items-center border border-[#F0E6D8] mb-6"
        style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 24 }}
      >
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" }} 
          className="w-[90px] h-[90px] rounded-full border-3 border-[#FFA726] mb-3" 
          style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#FFA726", marginBottom: 12 }}
        />
        <Text className="text-xl font-extrabold text-[#1E1B18]" style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18" }}>Robert Fox</Text>
        <Text className="text-xs text-slate-500 mb-5" style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>robert.fox@example.com</Text>

        <View className="flex-row justify-between w-full border-t border-slate-100 pt-4" style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16 }}>
          <View className="flex-1 items-center" style={{ flex: 1, alignItems: "center" }}>
            <Text className="text-lg font-extrabold text-[#1E1B18]" style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>12</Text>
            <Text className="text-[10px] text-slate-400 mt-1" style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>Courses</Text>
          </View>
          <View className="flex-1 items-center" style={{ flex: 1, alignItems: "center" }}>
            <Text className="text-lg font-extrabold text-[#1E1B18]" style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>87%</Text>
            <Text className="text-[10px] text-slate-400 mt-1" style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>Avg Progress</Text>
          </View>
          <View className="flex-1 items-center" style={{ flex: 1, alignItems: "center" }}>
            <Text className="text-lg font-extrabold text-[#1E1B18]" style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>4</Text>
            <Text className="text-[10px] text-slate-400 mt-1" style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>Certificates</Text>
          </View>
        </View>
      </View>

      <Text className="text-base font-bold text-[#1E1B18] mb-3.5" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18", marginBottom: 14 }}>Account Settings</Text>
      <View className="gap-3" style={{ gap: 12 }}>
        {[
          { icon: "person-circle-outline", text: "Edit Profile Information" },
          { icon: "notifications-outline", text: "Notification Preferences" },
          { icon: "shield-checkmark-outline", text: "Security & Privacy" }
        ].map((setting, idx) => (
          <TouchableOpacity 
            key={idx} 
            className="bg-white rounded-2xl p-4 flex-row justify-between items-center border border-[#F0E6D8]"
            style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}
          >
            <View className="flex-row items-center gap-3" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Ionicons name={setting.icon as any} size={22} color="#FFA726" />
              <Text className="text-[13px] text-[#1E1B18] font-semibold" style={{ fontSize: 13, color: "#1E1B18", fontWeight: "600" }}>{setting.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
