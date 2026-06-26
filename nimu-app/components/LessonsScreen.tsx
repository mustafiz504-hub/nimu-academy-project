import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LessonCard from "./LessonCard";
import AssignmentItem from "./AssignmentItem";

export default function LessonsScreen() {
  const [selectedDate, setSelectedDate] = useState(28); // SUN 28 selected by default
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Art & Drawings", category: "Arts", completed: false, count: "15 Kids completed" },
    { id: 2, title: "Reading", category: "Language", completed: false, count: "8 Kids completed" }
  ]);

  const toggleAssignment = (id: number) => {
    setAssignments(assignments.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <View className="flex-row items-center gap-3" style={{ flexDirection: "row", alignItems: "center" }}>
          <View 
            className="w-11 h-11 rounded-full overflow-hidden border border-[#FFA726]"
            style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "#FFA726", marginRight: 12 }}
          >
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" }} 
              style={{ width: 44, height: 44 }} 
            />
          </View>
          <View>
            <Text className="text-base font-bold text-[#1E1B18]" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18" }}>Robert Fox</Text>
            <Text className="text-[10px] text-[#FFA726] font-bold mt-0.5" style={{ fontSize: 11, color: "#FFA726", fontWeight: "600", marginTop: 2 }}>View Profile</Text>
          </View>
        </View>
      </View>

      {/* Calendar Strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20, marginBottom: 24 }}>
        {[
          { date: 27, day: "Sat" },
          { date: 28, day: "Sun" },
          { date: 29, day: "Mon" },
          { date: 30, day: "Tue" },
          { date: 31, day: "Wed" }
        ].map((item) => (
          <TouchableOpacity 
            key={item.date} 
            className={`w-[60px] h-[76px] rounded-2xl justify-center items-center border ${
              selectedDate === item.date ? "bg-[#FFA726] border-[#FFA726]" : "bg-white border-[#F0E6D8]"
            }`}
            style={{
              width: 60,
              height: 76,
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              backgroundColor: selectedDate === item.date ? "#FFA726" : "#FFFFFF",
              borderColor: selectedDate === item.date ? "#FFA726" : "#F0E6D8",
              marginRight: 12
            }}
            onPress={() => setSelectedDate(item.date)}
          >
            <Text 
              className={`text-base font-extrabold ${selectedDate === item.date ? "text-white" : "text-[#1E1B18]"}`}
              style={{ fontSize: 16, fontWeight: "800", color: selectedDate === item.date ? "#FFFFFF" : "#1E1B18" }}
            >
              {item.date}
            </Text>
            <Text 
              className={`text-[10px] font-semibold mt-1 ${selectedDate === item.date ? "text-white" : "text-slate-400"}`}
              style={{ fontSize: 10, fontWeight: "600", color: selectedDate === item.date ? "#FFFFFF" : "#94A3B8", marginTop: 4 }}
            >
              {item.day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Your Lesson Section */}
      <Text className="text-base font-bold text-[#1E1B18] mb-3" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18", marginBottom: 12 }}>Your Lesson</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20, marginBottom: 24 }}>
        <LessonCard 
          title="Sentence" 
          chapterText="8 chapter . 7 Lesson" 
          category="Language" 
          backgroundColor="#FFA726" 
          iconName="briefcase" 
          progress={75} 
        />
        <LessonCard 
          title="Biology" 
          chapterText="8 chapter . 7 Lesson" 
          category="Language" 
          backgroundColor="#29B6F6" 
          iconName="leaf" 
          progress={75} 
        />
      </ScrollView>

      {/* Assignments */}
      <Text className="text-base font-bold text-[#1E1B18] mb-3" style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18", marginBottom: 12 }}>Your Assignment</Text>
      <View className="gap-3" style={{ gap: 12 }}>
        {assignments.map((item) => (
          <AssignmentItem 
            key={item.id}
            id={item.id}
            title={item.title}
            category={item.category}
            completed={item.completed}
            count={item.count}
            onToggle={() => toggleAssignment(item.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
