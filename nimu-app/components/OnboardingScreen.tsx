import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OnboardingScreenProps {
  onNavigateToTab: (tab: "home" | "onboarding" | "lessons" | "profile") => void;
}

export default function OnboardingScreen({ onNavigateToTab }: OnboardingScreenProps) {
  return (
    <View className="flex-1 justify-center items-center p-8 bg-[#FDF8F0]" style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: "#FDF8F0" }}>
      {/* Main graphic */}
      <View 
        className="w-[260px] h-[260px] justify-center items-center relative mb-10"
        style={{ width: 260, height: 260, justifyContent: "center", alignItems: "center", position: "relative", marginBottom: 40 }}
      >
        <View 
          className="w-[220px] h-[220px] rounded-full bg-[#FFA726] justify-center items-center relative"
          style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: "#FFA726", justifyContent: "center", alignItems: "center", position: "relative" }}
        >
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=400" }} 
            className="w-[210px] h-[210px] rounded-full" 
            style={{ width: 210, height: 210, borderRadius: 105 }}
          />
          <View 
            className="absolute -bottom-2.5 right-1 w-20 h-20 rounded-full border-4 border-[#FDF8F0] overflow-hidden"
            style={{ position: "absolute", bottom: -10, right: 4, width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: "#FDF8F0", overflow: "hidden" }}
          >
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200" }} 
              className="w-full h-full" 
              style={{ width: 80, height: 80 }}
            />
          </View>
        </View>
        {/* Outer Circular reload arrow */}
        <View 
          className="absolute w-[260px] h-[260px] justify-center items-center pointer-events-none"
          style={{ position: "absolute", width: 260, height: 260, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="reload" size={240} color="#FFA726" className="opacity-10" style={{ opacity: 0.1 }} />
        </View>
      </View>

      <Text className="text-2xl font-extrabold text-[#1E1B18] text-center leading-8 mb-4" style={{ fontSize: 26, fontWeight: "800", color: "#1E1B18", textAlign: "center", lineHeight: 34, marginBottom: 16 }}>
        Tailor the Learning{"\n"}Experience
      </Text>
      <Text className="text-xs text-slate-500 text-center leading-5 px-4 mb-9" style={{ fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, paddingHorizontal: 16, marginBottom: 36 }}>
        Customize the app to match your child's learning pace and style. Learning should be as unique as your child!
      </Text>

      <TouchableOpacity 
        className="w-14 h-14 rounded-full bg-[#FF5722] justify-center items-center shadow-lg"
        style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FF5722", justifyContent: "center", alignItems: "center", elevation: 4 }}
        onPress={() => onNavigateToTab("lessons")}
      >
        <Ionicons name="play" size={24} color="white" className="ml-1" style={{ marginLeft: 3 }} />
      </TouchableOpacity>
    </View>
  );
}
