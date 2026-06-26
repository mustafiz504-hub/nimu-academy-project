import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";

// Re-export the ScheduleScreen (previously LessonsScreen)
export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(28);
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Art & Drawings", category: "Arts", completed: false, count: "15 Kids completed" },
    { id: 2, title: "Reading", category: "Language", completed: false, count: "8 Kids completed" },
  ]);

  const toggleAssignment = (id: number) => {
    setAssignments(assignments.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "#FFA726", marginRight: 12 }}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" }}
            style={{ width: 44, height: 44 }}
          />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18" }}>Robert Fox</Text>
          <Text style={{ fontSize: 11, color: "#FFA726", fontWeight: "600", marginTop: 2 }}>View Profile</Text>
        </View>
      </View>

      {/* Calendar Strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20, marginBottom: 24 }}>
        {[{ date: 27, day: "Sat" }, { date: 28, day: "Sun" }, { date: 29, day: "Mon" }, { date: 30, day: "Tue" }, { date: 31, day: "Wed" }].map((item) => (
          <TouchableOpacity
            key={item.date}
            style={{
              width: 60, height: 76, borderRadius: 18, justifyContent: "center", alignItems: "center", borderWidth: 1,
              backgroundColor: selectedDate === item.date ? "#FFA726" : "#FFFFFF",
              borderColor: selectedDate === item.date ? "#FFA726" : "#F0E6D8",
              marginRight: 12,
            }}
            onPress={() => setSelectedDate(item.date)}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: selectedDate === item.date ? "#FFFFFF" : "#1E1B18" }}>{item.date}</Text>
            <Text style={{ fontSize: 10, fontWeight: "600", color: selectedDate === item.date ? "#FFFFFF" : "#94A3B8", marginTop: 4 }}>{item.day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Your Lesson Section */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18", marginBottom: 12 }}>Your Lesson</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20, marginBottom: 24 }}>
        {[
          { title: "Sentence", chapterText: "8 chapter . 7 Lesson", category: "Language", backgroundColor: "#FFA726", iconName: "briefcase", progress: 75 },
          { title: "Biology", chapterText: "8 chapter . 7 Lesson", category: "Science", backgroundColor: "#29B6F6", iconName: "leaf", progress: 75 },
        ].map((lesson, idx) => (
          <View key={idx} style={{ width: 230, backgroundColor: lesson.backgroundColor, borderRadius: 24, padding: 20, minHeight: 170, marginRight: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>{lesson.title}</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>{lesson.chapterText}</Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 20 }}>
              {["Child", "5-8", lesson.category].map((tag) => (
                <View key={tag} style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                  <Text style={{ fontSize: 9, color: "#FFFFFF", fontWeight: "700" }}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{ flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3 }}>
                <View style={{ height: "100%", backgroundColor: "#FFFFFF", borderRadius: 3, width: `${lesson.progress}%` }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>{lesson.progress}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Assignments */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18", marginBottom: 12 }}>Your Assignment</Text>
      <View style={{ gap: 12 }}>
        {assignments.map((item) => (
          <View key={item.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 20 }}>{item.category === "Arts" ? "🎨" : "📖"}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{item.title}</Text>
                <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>{item.count}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: item.completed ? "#E2E8F0" : "#FF5722", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 }}
              onPress={() => toggleAssignment(item.id)}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: item.completed ? "#64748B" : "#FFFFFF" }}>
                {item.completed ? "Completed" : "Complete"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
