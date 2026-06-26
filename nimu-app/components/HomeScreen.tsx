import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CourseCard from "./CourseCard";

interface HomeScreenProps {
  onNavigateToTab: (tab: "home" | "onboarding" | "lessons" | "profile") => void;
}

export default function HomeScreen({ onNavigateToTab }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const courses = [
    {
      title: "Galaxy",
      subtitle: "Customize the app to your child's learning pace",
      category: "Science",
      backgroundColor: "#FFF3E0",
      iconName: "planet",
      accentColor: "#E65100",
      accentBgColor: "#FFE0B2"
    },
    {
      title: "Language",
      subtitle: "Customize the app to your child's learning pace",
      category: "Language",
      backgroundColor: "#E1F5FE",
      iconName: "book",
      accentColor: "#01579B",
      accentBgColor: "#B3E5FC"
    }
  ];

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <View className="flex-row items-center gap-3" style={{ flexDirection: "row", alignItems: "center" }}>
          <View 
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#FFA726]"
            style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden", borderWidth: 2, borderColor: "#FFA726", marginRight: 12 }}
          >
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" }} 
              style={{ width: 44, height: 44 }} 
            />
          </View>
          <View>
            <Text className="text-[11px] text-slate-500 font-semibold" style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Hello!</Text>
            <Text className="text-base font-bold text-[#1E1B18]" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18" }}>Robert Fox</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-white justify-center items-center border border-[#F0E6D8] relative"
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8", position: "relative" }}
        >
          <Ionicons name="notifications" size={20} color="#1E1B18" />
          <View 
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF5252]" 
            style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF5252" }}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="relative mb-5" style={{ position: "relative", marginBottom: 20 }}>
        <TextInput
          className="h-12 bg-white rounded-full px-5 pr-12 text-sm text-[#1E1B18] border border-[#F0E6D8]"
          style={{ height: 48, backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 20, paddingRight: 48, fontSize: 14, color: "#1E1B18", borderWidth: 1, borderColor: "#F0E6D8" }}
          placeholder="Search"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons 
          name="search" 
          size={20} 
          color="#94A3B8" 
          style={{ position: "absolute", right: 20, top: 14 }} 
        />
      </View>

      {/* Orange Study Report Card */}
      <View 
        className="bg-[#FFA726] rounded-3xl p-6 flex-row justify-between items-center mb-6 shadow-md"
        style={{ backgroundColor: "#FFA726", borderRadius: 24, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
      >
        <View className="flex-1 pr-4" style={{ flex: 1.2, paddingRight: 16 }}>
          <Text className="text-2xl font-extrabold text-white leading-7 mb-2" style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF", lineHeight: 28, marginBottom: 8 }}>Your Study{"\n"}Report</Text>
          <Text className="text-[11px] text-white/80 leading-4 mb-4" style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.8)", lineHeight: 16, marginBottom: 16 }}>Lorem ipsum dolor sit amet sectetur. Diam diam pellentesque.</Text>
          <TouchableOpacity 
            className="bg-white px-4 py-2 rounded-full self-start" 
            style={{ backgroundColor: "#FFFFFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, alignSelf: "flex-start" }}
            onPress={() => onNavigateToTab("lessons")}
          >
            <Text className="color-[#FFA726] text-[11px] font-bold" style={{ color: "#FF8A00", fontSize: 11, fontWeight: "700" }}>View Details</Text>
          </TouchableOpacity>
        </View>
        
        {/* Circular Progress */}
        <View 
          className="w-[84px] h-[84px] rounded-full border-4 border-white/30 justify-center items-center bg-white/10"
          style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: "rgba(255, 255, 255, 0.3)", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <Text className="text-base font-extrabold text-white" style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>87%</Text>
          <Text className="text-[8px] text-white/95 font-semibold" style={{ fontSize: 8, color: "rgba(255, 255, 255, 0.95)", fontWeight: "600" }}>Progress</Text>
        </View>
      </View>

      {/* Your Courses Section */}
      <View className="flex-row justify-between items-center mb-3" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text className="text-base font-bold text-[#1E1B18]" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18" }}>Your Courses</Text>
        <TouchableOpacity><Text className="text-xs text-[#FFA726] font-bold" style={{ fontSize: 12, color: "#FFA726", fontWeight: "700" }}>View All</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20, marginBottom: 24 }}>
        {filteredCourses.map((course, idx) => (
          <CourseCard key={idx} {...course} />
        ))}
        {filteredCourses.length === 0 && (
          <Text className="text-slate-400 my-4 px-4 text-xs font-semibold">No courses matched your search.</Text>
        )}
      </ScrollView>

      {/* Recommend Section */}
      <View className="flex-row justify-between items-center mb-3" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text className="text-base font-bold text-[#1E1B18]" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18" }}>Recommend</Text>
        <TouchableOpacity><Text className="text-xs text-[#FFA726] font-bold" style={{ fontSize: 12, color: "#FFA726", fontWeight: "700" }}>View All</Text></TouchableOpacity>
      </View>

      <View 
        className="bg-white rounded-2xl p-4 flex-row justify-between items-center border border-[#F0E6D8] mb-5"
        style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}
      >
        <View className="flex-row items-center gap-3" style={{ flexDirection: "row", alignItems: "center" }}>
          <View 
            className="w-11 h-11 rounded-xl bg-[#FFF3E0] justify-center items-center"
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginRight: 12 }}
          >
            <Ionicons name="brush" size={24} color="#FFA726" />
          </View>
          <View>
            <Text className="text-sm font-bold text-[#1E1B18]" style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>Art & Drawings</Text>
            <Text className="text-[10px] text-slate-400 mt-0.5" style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>75 People have participated</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="w-9 h-9 rounded-full bg-[#FFF3E0] justify-center items-center"
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="heart" size={18} color="#FF8A00" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
