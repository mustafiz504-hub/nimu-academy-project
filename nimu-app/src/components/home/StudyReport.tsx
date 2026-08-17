import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useProgressStore } from "../../store/progress.store";

interface StudyReportProps {
  onViewDetails?: () => void;
}

export default function StudyReport({ onViewDetails }: StudyReportProps) {
  const { myProgress, loading, fetchMyProgress } = useProgressStore();

  useEffect(() => {
    fetchMyProgress();
  }, [fetchMyProgress]);

  const percent      = myProgress?.overall_percent ?? 0;
  const totalWatched = myProgress?.total_watched   ?? 0;
  const totalVideos  = myProgress?.total_videos    ?? 0;
  const enrolled     = myProgress?.courses?.length ?? 0;

  // No enrolled courses yet
  if (!loading && enrolled === 0) {
    return (
      <View style={{ backgroundColor: "#FFA726", borderRadius: 24, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 }}>
          {"Your Study\nReport"}
        </Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>
          Enroll in a course to start tracking your progress!
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#FFFFFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, alignSelf: "flex-start" }}
          onPress={onViewDetails}
        >
          <Text style={{ color: "#FF8A00", fontSize: 11, fontWeight: "700" }}>Browse Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#FFA726", borderRadius: 24, padding: 16 }}>
      {/* Top row: title + circular progress */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFFFFF", lineHeight: 24, marginBottom: 2 }}>
            {"Your Study\nReport"}
          </Text>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={{ alignSelf: "flex-start", marginTop: 4 }} />
          ) : (
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", lineHeight: 18 }}>
              {totalWatched} of {totalVideos} videos watched{"\n"}across {enrolled} course{enrolled !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Circular percent */}
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          borderWidth: 4, borderColor: "rgba(255,255,255,0.35)",
          justifyContent: "center", alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.15)"
        }}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>{percent}%</Text>
              <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.95)", fontWeight: "600" }}>Progress</Text>
            </>
          )}
        </View>
      </View>

      {/* Progress bar */}
      {!loading && totalVideos > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, overflow: "hidden" }}>
            <View style={{ height: 6, width: `${percent}%` as any, backgroundColor: "#FFFFFF", borderRadius: 3 }} />
          </View>
        </View>
      )}

      {/* Per-course breakdown (max 2) */}
      {!loading && myProgress && myProgress.courses.slice(0, 2).map((c) => (
        <View key={c.course_id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: "600" }} numberOfLines={1}>
              {c.course_name}
            </Text>
            <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
              <View style={{ height: 4, width: `${c.percent}%` as any, backgroundColor: "#FFFFFF", borderRadius: 2 }} />
            </View>
          </View>
          <Text style={{ fontSize: 11, color: "#FFFFFF", fontWeight: "700", minWidth: 32, textAlign: "right" }}>
            {c.percent}%
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={{ backgroundColor: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, alignSelf: "flex-start", marginTop: 6 }}
        onPress={onViewDetails}
      >
        <Text style={{ color: "#FF8A00", fontSize: 11, fontWeight: "700" }}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}
