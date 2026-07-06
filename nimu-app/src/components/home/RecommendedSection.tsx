import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecommendedItem {
  icon: string;
  title: string;
  participants: string;
}

const DEFAULT_ITEMS: RecommendedItem[] = [
  { icon: "brush", title: "Art & Drawings", participants: "75 People have participated" },
  { icon: "musical-notes", title: "Music Basics", participants: "42 People have participated" },
];

export default function RecommendedSection({ items = DEFAULT_ITEMS }: { items?: RecommendedItem[] }) {
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E1B18" }}>Recommend</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 12, color: "#FFA726", fontWeight: "700" }}>View All</Text>
        </TouchableOpacity>
      </View>

      {items.map((item, idx) => (
        <View
          key={idx}
          style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 12 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
              <Ionicons name={item.icon as any} size={24} color="#FFA726" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{item.title}</Text>
              <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{item.participants}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="heart" size={18} color="#FF8A00" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
