import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface StudyReportProps {
  progress?: number;
  onViewDetails?: () => void;
}

export default function StudyReport({ progress = 87, onViewDetails }: StudyReportProps) {
  return (
    <View style={{ backgroundColor: "#FFA726", borderRadius: 24, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <View style={{ flex: 1.2, paddingRight: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF", lineHeight: 28, marginBottom: 8 }}>
          {"Your Study\nReport"}
        </Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 16, marginBottom: 16 }}>
          Lorem ipsum dolor sit amet sectetur. Diam diam pellentesque.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#FFFFFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, alignSelf: "flex-start" }}
          onPress={onViewDetails}
        >
          <Text style={{ color: "#FF8A00", fontSize: 11, fontWeight: "700" }}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Circular Progress */}
      <View style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)" }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>{progress}%</Text>
        <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.95)", fontWeight: "600" }}>Progress</Text>
      </View>
    </View>
  );
}
