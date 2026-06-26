import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCourses } from "../../hooks/useCourses";
import { courseService } from "../../services/course.service";
import type { Course, CourseVideo } from "../../types/course.types";

interface CourseDetailScreenProps {
  courseId: string;
  onBack: () => void;
}

export default function CourseDetailScreen({ courseId, onBack }: CourseDetailScreenProps) {
  const { fetchCourseVideos, courseVideos, loading: loadingVideos } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  
  // Player state
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // mock player state

  useEffect(() => {
    // Fetch course details
    const loadDetails = async () => {
      try {
        setLoadingCourse(true);
        const data = await courseService.getById(courseId);
        setCourse(data);
      } catch (err) {
        console.error("Failed to fetch course", err);
      } finally {
        setLoadingCourse(false);
      }
    };
    
    loadDetails();
    fetchCourseVideos(courseId);
  }, [courseId, fetchCourseVideos]);

  // Set initial video when videos load
  useEffect(() => {
    if (courseVideos.length > 0 && !activeVideo) {
      setActiveVideo(courseVideos[0]);
    }
  }, [courseVideos, activeVideo]);

  const handlePlayVideo = (video: CourseVideo) => {
    setActiveVideo(video);
    setIsPlaying(true);
  };

  if (loadingCourse) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
        <Text>Course not found.</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: "#FF8C00", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Top Bar ── */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}>
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "800", color: "#1E1B18" }} numberOfLines={1}>
          {course.name}
        </Text>
        <View style={{ width: 40 }} /> {/* balance */}
      </View>

      {/* ── Video Player Area ── */}
      <View style={{ width: "100%", aspectRatio: 16/9, backgroundColor: "#000", position: "relative" }}>
        {activeVideo ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {activeVideo.thumbnail_url && !isPlaying ? (
              <Image source={{ uri: activeVideo.thumbnail_url }} style={StyleSheet.absoluteFillObject} opacity={0.6} />
            ) : null}
            
            {/* Fake player controls overlay */}
            <TouchableOpacity 
              onPress={() => setIsPlaying(!isPlaying)}
              style={{ width: 64, height: 64, backgroundColor: "rgba(255, 140, 0, 0.9)", borderRadius: 32, justifyContent: "center", alignItems: "center" }}
            >
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFFFFF" style={{ marginLeft: isPlaying ? 0 : 4 }} />
            </TouchableOpacity>

            {/* Bottom progress bar fake */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, backgroundColor: "rgba(0,0,0,0.5)", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 }}>
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>02:14</Text>
              <View style={{ flex: 1, height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2 }}>
                <View style={{ width: "30%", height: "100%", backgroundColor: "#FF8C00", borderRadius: 2 }} />
              </View>
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>{activeVideo.duration_minutes}:00</Text>
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* ── Course Info ── */}
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E1B18", marginBottom: 8 }}>{activeVideo?.title || course.name}</Text>
        <Text style={{ fontSize: 14, color: "#64748B", lineHeight: 22, marginBottom: 24 }}>
          {activeVideo?.description || course.description || "Learn step-by-step from our expert chefs."}
        </Text>

        {/* ── Playlist Header ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>Course Playlist</Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}>{courseVideos.length} Videos</Text>
        </View>

        {/* ── Video List ── */}
        {loadingVideos ? (
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
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#94A3B8" }}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    )}
                  </View>

                  {/* Details */}
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: isActive ? "#FF8C00" : "#1E1B18", marginBottom: 4 }}>
                      {video.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="time-outline" size={14} color="#94A3B8" />
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>{video.duration_minutes} mins</Text>
                      {video.is_free && (
                        <View style={{ backgroundColor: "#ECFCCB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 }}>
                          <Text style={{ fontSize: 9, color: "#65A30D", fontWeight: "800" }}>FREE</Text>
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
