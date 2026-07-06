import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  return (
    <View style={{ backgroundColor: "#1E1B18", borderRadius: 20, overflow: "hidden", aspectRatio: 16 / 9, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,140,0,0.9)", justifyContent: "center", alignItems: "center" }}
      >
        <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
      {title && (
        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600", marginTop: 12, textAlign: "center" }}>{title}</Text>
      )}
    </View>
  );
}
