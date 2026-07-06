import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

// Navigation
import { BottomTabNavigator } from "../src/navigation";
import type { TabName } from "../src/navigation";

// Auth Screens
import LoginScreen from "../src/screens/auth/LoginScreen";
import RegisterScreen from "../src/screens/auth/RegisterScreen";

// Main App Screens
import HomeScreen from "../src/screens/home/HomeScreen";
import CoursesScreen from "../src/screens/courses/CoursesScreen";
import CourseDetailScreen from "../src/screens/courses/CourseDetailScreen";
import ScheduleScreen from "../src/screens/schedule/ScheduleScreen";
import ProfileScreen from "../src/screens/profile/ProfileScreen";
import AdminScreen from "../src/screens/admin/AdminScreen";

// Stores
import { useAuthStore } from "../src/store/auth.store";

type AuthPage = "login" | "register";

export default function Index() {
  const [currentTab, setCurrentTab] = useState<TabName>("home");
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [isBooting, setIsBooting] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { isAuthenticated, user, loadFromStorage } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // On app launch — restore session from storage + validate with server
  useEffect(() => {
    loadFromStorage().finally(() => setIsBooting(false));
  }, []);

  // ── Splash / Loading ──────────────────────────────────────────────────────
  if (isBooting) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="dark" />
        <View
          style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: "#FF8C00",
            justifyContent: "center", alignItems: "center",
            marginBottom: 20,
            shadowColor: "#FF8C00",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
          }}
        >
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      </View>
    );
  }

  // ── Not Authenticated → Auth screens ─────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="dark" />
        {authPage === "login" ? (
          <LoginScreen onGoToRegister={() => setAuthPage("register")} />
        ) : (
          <RegisterScreen onGoToLogin={() => setAuthPage("login")} />
        )}
      </>
    );
  }

  // ── Authenticated → Main App ──────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        {selectedCourseId ? (
          <CourseDetailScreen
            courseId={selectedCourseId}
            onBack={() => setSelectedCourseId(null)}
          />
        ) : (
          <>
            {/* Always mounted — display:none keeps screens alive so
                useEffect doesn't re-fire and Zustand cache works. */}
            <View style={{ flex: 1, display: currentTab === "home" ? "flex" : "none" }}>
              <HomeScreen onNavigateToTab={setCurrentTab} onCourseSelect={setSelectedCourseId} />
            </View>
            <View style={{ flex: 1, display: currentTab === "courses" ? "flex" : "none" }}>
              <CoursesScreen onCourseSelect={setSelectedCourseId} />
            </View>
            <View style={{ flex: 1, display: currentTab === "schedule" ? "flex" : "none" }}>
              <ScheduleScreen />
            </View>
            <View style={{ flex: 1, display: currentTab === "profile" ? "flex" : "none" }}>
              <ProfileScreen />
            </View>
            {/* Admin tab — only mounted if user is admin/superadmin */}
            {isAdmin && (
              <View style={{ flex: 1, display: currentTab === "admin" ? "flex" : "none" }}>
                <AdminScreen />
              </View>
            )}
          </>
        )}
      </View>

      {!selectedCourseId && (
        <BottomTabNavigator
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isAdmin={isAdmin}
        />
      )}
    </SafeAreaView>
  );
}
