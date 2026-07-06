import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCourseStore } from "../../store/course.store";
import type { CourseVideo } from "../../types/course.types";

interface CourseDetailScreenProps {
  courseId: string;
  onBack: () => void;
}

export default function CourseDetailScreen({ courseId, onBack }: CourseDetailScreenProps) {
  const {
    courseDetails,
    courseVideos: allCourseVideos,
    myEnrollments,
    lastPlayedVideo,
    loadingDetail,
    loadingVideos,
    refreshingDetail,
    fetchCourseDetail,
    fetchCourseVideos,
    refreshCourseDetail,
    refreshCourseVideos,
    setLastPlayedVideo,
  } = useCourseStore();

  // Read from store cache
  const course = courseDetails[courseId] ?? null;
  const courseVideos = allCourseVideos[courseId] ?? [];

  // activeVideo: prefer last played (from store), else first video in list
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(
    lastPlayedVideo[courseId] ?? null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // On mount: load from cache (no-op if already cached)
  useEffect(() => {
    fetchCourseDetail(courseId);
    fetchCourseVideos(courseId);
  }, [courseId, fetchCourseDetail, fetchCourseVideos]);

  // Set initial video: use last played if available, else first in list
  useEffect(() => {
    if (courseVideos.length > 0 && !activeVideo) {
      const resumeVideo = lastPlayedVideo[courseId] ?? courseVideos[0];
      setActiveVideo(resumeVideo);
    }
  }, [courseVideos, activeVideo, courseId, lastPlayedVideo]);

  // Pull-to-refresh: force re-fetch both course + videos
  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshCourseDetail(courseId), refreshCourseVideos(courseId)]);
  }, [courseId, refreshCourseDetail, refreshCourseVideos]);

  const isFreeCourse = Number(course?.price) === 0;
  const isEnrolled = myEnrollments.some((e) => String(e.course_id) === String(courseId));
  const isUnlocked = isFreeCourse || isEnrolled;

  const handlePlayVideo = (video: CourseVideo) => {
    if (!isUnlocked && !video.is_free) {
      Alert.alert("Course Locked 🔒", "Please purchase this course to watch premium lessons.");
      return;
    }
    setActiveVideo(video);
    setIsPlaying(true);
    // ── Persist last played video in store ──
    setLastPlayedVideo(courseId, video);
  };

  // ── Loading skeleton (first load only) ──────────────────────────────────
  if (loadingDetail && !course) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#1E1B18" }}>Course not found.</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: "#FF8C00", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalVideos = courseVideos.length;
  const lastPlayedIndex = activeVideo
    ? courseVideos.findIndex((v) => v.id === activeVideo.id)
    : -1;

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Top Bar: Fixed heading "Course Detail" ── */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          {/* Fixed page name */}
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18" }}>
            Course Detail
          </Text>
          {/* Course name as subtitle */}
          <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "500", marginTop: 1 }} numberOfLines={1}>
            {course.name}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* ── Stats Row: Total videos + last played indicator ── */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingBottom: 10, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF3E0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Ionicons name="play-circle" size={13} color="#FF8C00" />
          <Text style={{ fontSize: 11, color: "#FF8C00", fontWeight: "700" }}>
            {totalVideos} {totalVideos === 1 ? "Video" : "Videos"}
          </Text>
        </View>

        {activeVideo && lastPlayedIndex >= 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFCCB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Ionicons name="time" size={13} color="#65A30D" />
            <Text style={{ fontSize: 11, color: "#65A30D", fontWeight: "700" }}>
              Last: #{lastPlayedIndex + 1} {activeVideo.title.length > 18 ? activeVideo.title.slice(0, 18) + "…" : activeVideo.title}
            </Text>
          </View>
        )}
      </View>

      {/* ── Video Player Area ── */}
      <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" }}>
        {!isUnlocked && (!activeVideo || !activeVideo.is_free) ? (
          // Lock overlay for premium courses
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E1B18" }}>
            <Ionicons name="lock-closed" size={48} color="#FF8C00" />
            <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginTop: 12 }}>Premium Course</Text>
            <Text style={{ color: "#94A3B8", fontSize: 13, marginTop: 4, textAlign: "center", paddingHorizontal: 20 }}>
              Enroll in this course to unlock all video lessons and materials.
            </Text>
            <TouchableOpacity style={{ backgroundColor: "#FF8C00", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 20 }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Enroll for ₹{course.price}</Text>
            </TouchableOpacity>
          </View>
        ) : activeVideo ? (
          // Player UI
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {activeVideo.thumbnail_url && !isPlaying ? (
              <Image source={{ uri: activeVideo.thumbnail_url }} style={StyleSheet.absoluteFillObject} />
            ) : null}
            {/* Dark overlay when thumbnail shown */}
            {!isPlaying && activeVideo.thumbnail_url && (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.35)" }]} />
            )}

            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={{ width: 64, height: 64, backgroundColor: "rgba(255, 140, 0, 0.9)", borderRadius: 32, justifyContent: "center", alignItems: "center" }}
            >
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFFFFF" style={{ marginLeft: isPlaying ? 0 : 4 }} />
            </TouchableOpacity>

            {/* Video title overlay */}
            <View style={{ position: "absolute", top: 12, left: 12, right: 12 }}>
              <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
                {activeVideo.title}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, backgroundColor: "rgba(0,0,0,0.5)", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 }}>
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>00:00</Text>
              <View style={{ flex: 1, height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2 }}>
                <View style={{ width: "0%", height: "100%", backgroundColor: "#FF8C00", borderRadius: 2 }} />
              </View>
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
                {activeVideo.duration_minutes ? `${activeVideo.duration_minutes}:00` : "--:--"}
              </Text>
              <Ionicons name="expand" size={16} color="#FFF" />
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="film-outline" size={48} color="#333" />
            <Text style={{ color: "#666", marginTop: 8 }}>Select a video to play</Text>
          </View>
        )}
      </View>

      {/* ── Scrollable playlist with pull-to-refresh ── */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingDetail}
            onRefresh={handleRefresh}
            colors={["#FF8C00"]}
            tintColor="#FF8C00"
            title="Refreshing..."
            titleColor="#94A3B8"
          />
        }
      >
        {/* ── Now Playing info ── */}
        {activeVideo && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }}>
              {activeVideo.title}
            </Text>
            <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>
              {activeVideo.description || course.description || "Learn step-by-step from our expert chefs."}
            </Text>
          </View>
        )}

        {/* ── Playlist Header ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>Course Playlist</Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}>
            {totalVideos} {totalVideos === 1 ? "Video" : "Videos"}
          </Text>
        </View>

        {/* ── Video List ── */}
        {loadingVideos && courseVideos.length === 0 ? (
          <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 20 }} />
        ) : courseVideos.length === 0 ? (
          <View style={{ backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}>
            <Ionicons name="videocam-off-outline" size={40} color="#CBD5E1" />
            <Text style={{ marginTop: 12, color: "#64748B", fontWeight: "500" }}>No videos uploaded yet.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {courseVideos.map((video, index) => {
              const isActive = activeVideo?.id === video.id;
              const isLastPlayed = lastPlayedVideo[courseId]?.id === video.id;
              return (
                <TouchableOpacity
                  key={video.id}
                  onPress={() => handlePlayVideo(video)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isActive ? "#FFFBF5" : "#FFFFFF",
                    borderRadius: 16,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: isActive ? "#FF8C00" : "#F0E6D8",
                  }}
                >
                  {/* Thumbnail / Number */}
                  <View style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: isActive ? "#FF8C00" : "#F8F9FA", justifyContent: "center", alignItems: "center" }}>
                    {isActive ? (
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                    ) : !isUnlocked && !video.is_free ? (
                      <Ionicons name="lock-closed" size={20} color="#CBD5E1" />
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#94A3B8" }}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    )}
                  </View>

                  {/* Details */}
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: isActive ? "#FF8C00" : "#1E1B18", marginBottom: 4 }}>
                      {video.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Ionicons name="time-outline" size={14} color="#94A3B8" />
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
                        {video.duration_minutes} mins
                      </Text>
                      {video.is_free && (
                        <View style={{ backgroundColor: "#ECFCCB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 9, color: "#65A30D", fontWeight: "800" }}>FREE</Text>
                        </View>
                      )}
                      {isLastPlayed && !isActive && (
                        <View style={{ backgroundColor: "#FFF3E0", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 9, color: "#FF8C00", fontWeight: "800" }}>LAST PLAYED</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Right Icon */}
                  <Ionicons name="play-circle-outline" size={24} color={isActive ? "#FF8C00" : "#CBD5E1"} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
