import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Animated,
  FlatList,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as ExpoLinking from "expo-linking";
import { useCourseStore } from "../../store/course.store";
import { useAuthStore } from "../../store/auth.store";
import type { Course, CourseVideo } from "../../types/course.types";
import VideoPlayer from "../../components/common/VideoPlayer";
import api from "../../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — sort so free courses come first
// ─────────────────────────────────────────────────────────────────────────────
function sortFreesFirst(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const aFree = Number(a.price) === 0 ? 0 : 1;
    const bFree = Number(b.price) === 0 ? 0 : 1;
    return aFree - bFree;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CourseDropdown — animated pill + modal list
// ─────────────────────────────────────────────────────────────────────────────
interface CourseDropdownProps {
  courses: Course[];
  selectedId: string | null;
  onSelect: (course: Course) => void;
  myEnrollments: { course_id: string }[];
}

function CourseDropdown({ courses, selectedId, onSelect, myEnrollments }: CourseDropdownProps) {
  const [open, setOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-12)).current;

  const selected = courses.find((c) => String(c.id) === String(selectedId));

  const openModal = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -12, duration: 160, useNativeDriver: true }),
    ]).start(() => setOpen(false));
  };

  const handleSelect = (course: Course) => {
    onSelect(course);
    closeModal();
  };

  return (
    <>
      {/* Trigger pill */}
      <TouchableOpacity
        onPress={openModal}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: "#F0E6D8",
          shadowColor: "#FF8C00",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
          maxWidth: 220,
        }}
      >
        <Ionicons name="layers-outline" size={15} color="#FF8C00" />
        <Text
          numberOfLines={1}
          style={{ fontSize: 13, fontWeight: "700", color: "#1E1B18", flex: 1 }}
        >
          {selected?.name ?? "Select Course"}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color="#94A3B8" />
      </TouchableOpacity>

      {/* Modal picker */}
      <Modal transparent visible={open} animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 100 : 80,
              left: 16,
              right: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 20,
              elevation: 12,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#F0E6D8",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#1E1B18" }}>
                Switch Course
              </Text>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={sortFreesFirst(courses)}
              keyExtractor={(item) => String(item.id)}
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isFree = Number(item.price) === 0;
                const isEnrolled = myEnrollments.some(
                  (e) => String(e.course_id) === String(item.id)
                );
                const isSelected = String(item.id) === String(selectedId);
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 18,
                      paddingVertical: 14,
                      backgroundColor: isSelected ? "#FFF8F0" : "#FFFFFF",
                      borderBottomWidth: 1,
                      borderBottomColor: "#F9F4EE",
                    }}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: isFree ? "#ECFCCB" : isEnrolled ? "#FFF3E0" : "#F1F5F9",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name={isFree ? "gift-outline" : isEnrolled ? "checkmark-circle-outline" : "lock-closed-outline"}
                        size={18}
                        color={isFree ? "#65A30D" : isEnrolled ? "#FF8C00" : "#CBD5E1"}
                      />
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: isSelected ? "#FF8C00" : "#1E1B18",
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "500", marginTop: 1 }}>
                        {isFree ? "Free" : isEnrolled ? "Enrolled" : `₹${item.price}`}
                      </Text>
                    </View>

                    {/* Badge */}
                    {isFree && (
                      <View
                        style={{
                          backgroundColor: "#ECFCCB",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: "#65A30D", fontWeight: "800" }}>
                          FREE
                        </Text>
                      </View>
                    )}
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#FF8C00" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const EMPTY_VIDEOS: CourseVideo[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// LearnScreen — main component
// ─────────────────────────────────────────────────────────────────────────────
interface LearnScreenProps {
  isActive?: boolean;
  selectedCourseId: string | null;
  onSelectCourse: (id: string | null) => void;
}

export default function LearnScreen({ isActive = true, selectedCourseId: propSelectedCourseId, onSelectCourse }: LearnScreenProps) {
  const {
    courses,
    courseDetails,
    courseVideos: allCourseVideos,
    myEnrollments,
    lastPlayedVideo,
    selectedCourseId: storeSelectedCourseId,
    setSelectedCourseId: setStoreSelectedCourseId,
    loadingCourses,
    loadingDetail,
    loadingVideos,
    refreshingDetail,
    hasFetchedCourses,
    fetchAllCourses,
    fetchMyEnrollments,
    fetchCourseDetail,
    fetchCourseVideos,
    refreshCourseDetail,
    refreshCourseVideos,
    refreshMyEnrollments,
    setLastPlayedVideo,
  } = useCourseStore();

  const { user } = useAuthStore();
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const selectedCourseId = propSelectedCourseId || storeSelectedCourseId;

  // ── 1. Load all courses + enrollments on mount ───────────────────────────
  useEffect(() => {
    fetchAllCourses();
    fetchMyEnrollments(); // Ensure enrollment state is always loaded in LearnScreen
  }, [fetchAllCourses, fetchMyEnrollments]);

  // ── 2. Auto-select first accessible course once courses are loaded ────────
  useEffect(() => {
    if (courses.length === 0 || selectedCourseId) return;

    // Prefer free courses first, then enrolled, then anything
    const sorted = sortFreesFirst(courses);
    const firstId = String(sorted[0].id);
    onSelectCourse(firstId);
    setStoreSelectedCourseId(firstId);
  }, [courses.length, selectedCourseId]);

  // ── 3. Load detail + videos whenever selected course changes ─────────────
  useEffect(() => {
    if (!selectedCourseId) return;
    fetchCourseDetail(selectedCourseId);
    fetchCourseVideos(selectedCourseId);
  }, [selectedCourseId, fetchCourseDetail, fetchCourseVideos]);

  // ── 4. Set active video from lastPlayed or first video ───────────────────
  const courseVideos = selectedCourseId ? (allCourseVideos[selectedCourseId] || EMPTY_VIDEOS) : EMPTY_VIDEOS;
  const course = selectedCourseId ? (courseDetails[selectedCourseId] || null) : null;

  useEffect(() => {
    if (!selectedCourseId || courseVideos.length === 0) {
      setActiveVideo(null);
      return;
    }
    const saved = lastPlayedVideo[selectedCourseId];
    if (saved) {
      setActiveVideo(saved);
      return;
    }
    // For locked courses, auto-select first free video only (not a paid one)
    const firstFree = courseVideos.find((v) => v.is_free);
    setActiveVideo(firstFree ?? courseVideos[0]);
  }, [selectedCourseId, courseVideos]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isFreeCourse = Number(course?.price) === 0;
  // DEFINITIVE check: use myEnrollments as source of truth (server-confirmed status)
  // This bypasses any stale courseAccess cache that may be in memory
  const isEnrolled = myEnrollments.some(
    (e) =>
      String(e.course_id) === String(selectedCourseId) &&
      (e.status === "confirmed" || e.status === "completed")
  );
  const isUnlocked = isFreeCourse || isEnrolled;

  const handleRefresh = useCallback(async () => {
    if (!selectedCourseId) return;
    await Promise.all([
      refreshCourseDetail(selectedCourseId),
      refreshCourseVideos(selectedCourseId),
      refreshMyEnrollments(), // Always refresh enrollment status too
    ]);
  }, [selectedCourseId, refreshCourseDetail, refreshCourseVideos, refreshMyEnrollments]);

  const handlePlayVideo = (video: CourseVideo) => {
    if (!isUnlocked && !video.is_free) {
      // Scroll hint — footer is already visible, no modal needed
      return;
    }
    setActiveVideo(video);
    if (selectedCourseId) setLastPlayedVideo(selectedCourseId, video);
  };

  const handleEnrollNow = async () => {
    if (!course || !selectedCourseId) return;
    try {
      setPaymentLoading(true);
      
      const { paymentService } = require("../../services/payment.service");
      
      // 1. Create Order
      const order = await paymentService.createOrder(selectedCourseId, Number(course.price));
      
      // 2. Expo Go detection — react-native-razorpay native module nahi chalta Expo Go mein
      //    Constants.appOwnership === 'expo' matlab Expo Go app hai
      const isExpoGo = Constants.appOwnership === 'expo';

      if (isExpoGo) {
        // ── EXPO GO: Real Razorpay via openAuthSessionAsync + ExpoLinking ────────
        //    ExpoLinking.createURL generates valid deep link URL (exp://... in Expo Go)
        //    openAuthSessionAsync detects the redirect, CLOSES the browser, and returns the result!
        setPaymentLoading(false);

        const redirectUrl = ExpoLinking.createURL('razorpay-callback');
        const { API_BASE_URL } = require("../../constants/api");
        const checkoutUrl = `${API_BASE_URL}/payments/checkout-page?order_id=${encodeURIComponent(order.order_id)}&amount=${order.amount}&course_id=${encodeURIComponent(selectedCourseId)}&course_name=${encodeURIComponent(course.name)}&user_name=${encodeURIComponent(user?.name || '')}&user_email=${encodeURIComponent(user?.email || '')}&user_phone=${encodeURIComponent(user?.phone || '')}&redirect_url=${encodeURIComponent(redirectUrl)}`;

        const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);

        if (result.type === 'success' && result.url) {
          const parsed = ExpoLinking.parse(result.url);
          const status = parsed.queryParams?.status as string;

          if (status === 'success') {
            const razorpay_order_id   = (parsed.queryParams?.order_id as string)   || '';
            const razorpay_payment_id = (parsed.queryParams?.payment_id as string) || '';
            const razorpay_signature  = (parsed.queryParams?.signature as string)  || '';

            setPaymentLoading(true);
            try {
              await paymentService.verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
              await handleRefresh();
            } catch {
              await handleRefresh();
            } finally {
              setPaymentLoading(false);
            }
          } else if (status === 'cancelled') {
            // Quiet cancel
          }
        }
        return;
      }

      // 3. Real Razorpay Checkout (Custom Dev Client / Production build)
      const RazorpayCheckout = require("react-native-razorpay").default;
      const options = {
        description: `Enrollment for ${course.name}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: String(order.amount),
        name: 'Nimu Academy',
        order_id: order.order_id,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.name || ''
        },
        theme: { color: '#FF8C00' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        try {
          await paymentService.verifyPayment(data);
          await handleRefresh();
        } catch (verErr: any) {
          await handleRefresh();
        }
      }).catch((error: any) => {
        // Quiet cancel or soft notice
      });
      
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Could not initiate payment.";
      Alert.alert("Error", msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCourseSelect = (c: Course) => {
    onSelectCourse(String(c.id));
  };

  const totalVideos = courseVideos.length;
  const lastPlayedIndex = activeVideo
    ? courseVideos.findIndex((v) => v.id === activeVideo.id)
    : -1;

  // ── Loading state (initial courses load) ─────────────────────────────────
  if (loadingCourses && !hasFetchedCourses) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={{ marginTop: 12, color: "#94A3B8", fontWeight: "600", fontSize: 13 }}>
          Loading courses…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 10,
        }}
      >
        {/* Title */}
        <View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1E1B18", letterSpacing: -0.3 }}>
            Learn
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", fontWeight: "500", marginTop: 1 }}>
            Watch & grow 🎯
          </Text>
        </View>

        {/* Course switcher dropdown */}
        <CourseDropdown
          courses={courses}
          selectedId={selectedCourseId}
          onSelect={(course) => {
            onSelectCourse(String(course.id));
            setActiveVideo(null); // Reset video on course change
          }}
          myEnrollments={myEnrollments as any}
        />
      </View>

      {/* ── Stats pills ──────────────────────────────────────────────────── */}
      {course && (
        <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingBottom: 10, gap: 8 }}>
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: "#FFF3E0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
            }}
          >
            <Ionicons name="play-circle" size={13} color="#FF8C00" />
            <Text style={{ fontSize: 11, color: "#FF8C00", fontWeight: "700" }}>
              {totalVideos} {totalVideos === 1 ? "Video" : "Videos"}
            </Text>
          </View>

          {isFreeCourse && (
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                backgroundColor: "#ECFCCB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
              }}
            >
              <Ionicons name="gift-outline" size={13} color="#65A30D" />
              <Text style={{ fontSize: 11, color: "#65A30D", fontWeight: "700" }}>Free</Text>
            </View>
          )}

          {isEnrolled && !isFreeCourse && (
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                backgroundColor: "#ECFCCB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
              }}
            >
              <Ionicons name="checkmark-circle" size={13} color="#65A30D" />
              <Text style={{ fontSize: 11, color: "#65A30D", fontWeight: "700" }}>Enrolled</Text>
            </View>
          )}

          {activeVideo && lastPlayedIndex >= 0 && (
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                backgroundColor: "#F0F9FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
              }}
            >
              <Ionicons name="time" size={13} color="#0EA5E9" />
              <Text style={{ fontSize: 11, color: "#0EA5E9", fontWeight: "700" }}>
                #{lastPlayedIndex + 1}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── No courses at all ────────────────────────────────────────────── */}
      {courses.length === 0 && !loadingCourses && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
          <Ionicons name="library-outline" size={56} color="#CBD5E1" />
          <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "700", color: "#64748B" }}>
            No courses available
          </Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: "#94A3B8", textAlign: "center" }}>
            Check back soon for new content!
          </Text>
        </View>
      )}

      {/* ── Loading course detail ─────────────────────────────────────────── */}
      {selectedCourseId && loadingDetail && !course && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      {course && (
        <>


          {/* Video Player — HARD GUARD: never renders if user is not unlocked */}
          {!isUnlocked && !isFreeCourse ? (
            <View
              style={{
                width: "100%",
                aspectRatio: 16 / 9,
                backgroundColor: "#1E1B18",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: "rgba(255,140,0,0.15)",
                  justifyContent: "center", alignItems: "center", marginBottom: 8,
                }}
              >
                <Ionicons name="lock-closed" size={36} color="#FF8C00" />
              </View>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>Premium Course</Text>
              <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 4 }}>Enroll below to unlock</Text>
            </View>
          ) : activeVideo?.video_url ? (
            <VideoPlayer videoUrl={activeVideo.video_url} title={activeVideo.title} autoPlay isActive={isActive} />
          ) : (
            <View
              style={{
                width: "100%", aspectRatio: 16 / 9,
                backgroundColor: "#000", justifyContent: "center", alignItems: "center",
              }}
            >
              <Ionicons name="film-outline" size={48} color="#333" />
              <Text style={{ color: "#666", marginTop: 8 }}>Select a video to play</Text>
            </View>
          )}

          {/* Scrollable playlist */}
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: !isUnlocked && !isFreeCourse ? 100 : 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshingDetail}
                onRefresh={handleRefresh}
                colors={["#FF8C00"]}
                tintColor="#FF8C00"
              />
            }
          >
            {/* Now Playing info */}
            {activeVideo && (
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18", marginBottom: 4 }}>
                  {activeVideo.title}
                </Text>
                <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>
                  {activeVideo.description || course.description || "Learn step-by-step from our experts."}
                </Text>
              </View>
            )}

            {/* Playlist header */}
            <View
              style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#1E1B18" }}>
                Course Playlist
              </Text>
              <Text style={{ fontSize: 12, color: "#94A3B8", fontWeight: "600" }}>
                {totalVideos} {totalVideos === 1 ? "Video" : "Videos"}
              </Text>
            </View>

            {/* Video list */}
            {loadingVideos && courseVideos.length === 0 ? (
              <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 20 }} />
            ) : courseVideos.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#FFFFFF", padding: 24, borderRadius: 16,
                  alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8",
                }}
              >
                <Ionicons name="videocam-off-outline" size={40} color="#CBD5E1" />
                <Text style={{ marginTop: 12, color: "#64748B", fontWeight: "500" }}>
                  No videos uploaded yet.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {courseVideos.map((video, index) => {
                  const isActive = activeVideo?.id === video.id;
                  const isLastPlayed =
                    selectedCourseId && lastPlayedVideo[selectedCourseId]?.id === video.id;
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
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          backgroundColor: isActive ? "#FF8C00" : "#F8F9FA",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {isActive ? (
                          <Ionicons name="play" size={22} color="#FFFFFF" />
                        ) : !isUnlocked && !video.is_free ? (
                          <Ionicons name="lock-closed" size={18} color="#CBD5E1" />
                        ) : (
                          <Text style={{ fontSize: 15, fontWeight: "800", color: "#94A3B8" }}>
                            {String(index + 1).padStart(2, "0")}
                          </Text>
                        )}
                      </View>

                      {/* Details */}
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: isActive ? "#FF8C00" : "#1E1B18",
                            marginBottom: 4,
                          }}
                          numberOfLines={1}
                        >
                          {video.title}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Ionicons name="time-outline" size={13} color="#94A3B8" />
                          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
                            {video.duration_minutes} mins
                          </Text>
                          {video.is_free && (
                            <View
                              style={{
                                backgroundColor: "#ECFCCB",
                                paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
                              }}
                            >
                              <Text style={{ fontSize: 9, color: "#65A30D", fontWeight: "800" }}>
                                FREE
                              </Text>
                            </View>
                          )}
                          {isLastPlayed && !isActive && (
                            <View
                              style={{
                                backgroundColor: "#FFF3E0",
                                paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
                              }}
                            >
                              <Text style={{ fontSize: 9, color: "#FF8C00", fontWeight: "800" }}>
                                LAST PLAYED
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Right Icon */}
                      <Ionicons
                        name="play-circle-outline"
                        size={22}
                        color={isActive ? "#FF8C00" : "#CBD5E1"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* ── Floating Enroll Card (Matching App UI) ───────────────────── */}
          {!isUnlocked && !isFreeCourse && (
            <View
              style={{
                position: "absolute",
                bottom: 12,
                left: 16,
                right: 16,
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#F0E6D8",
                paddingHorizontal: 18,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#FF8C00",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {/* Price & Badge */}
              <View style={{ gap: 2 }}>
                <View
                  style={{
                    backgroundColor: "#FFF3E0",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#FF8C00", letterSpacing: 0.5 }}>
                    PREMIUM COURSE
                  </Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E1B18", letterSpacing: -0.5 }}>
                  ₹{course?.price ? Math.round(Number(course.price)).toLocaleString("en-IN") : "--"}
                </Text>
              </View>

              {/* Enroll Button */}
              <TouchableOpacity
                onPress={handleEnrollNow}
                disabled={paymentLoading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: paymentLoading ? "#FFC04D" : "#FF8C00",
                  width: 150,
                  height: 48,
                  borderRadius: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#FF8C00",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {paymentLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>
                      Enroll Now
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
